import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, donor_name, donor_email, donor_phone, user_id, amount, currency, campaign_id, sponsorship_request_id, transaction_id, tx_ref } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: settingsRows } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['flutterwave_public_key', 'flutterwave_secret_key'])

    const settings: Record<string, string> = {}
    ;(settingsRows ?? []).forEach((r: any) => { settings[r.key] = r.value })

    const flw_public_key = settings.flutterwave_public_key
    const flw_secret_key = settings.flutterwave_secret_key

    if (action === 'initialize') {
      if (!donor_name || !amount) {
        return new Response(
          JSON.stringify({ error: 'donor_name and amount are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const flw_ref = `SJ-DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const { data, error } = await supabaseAdmin
        .from('donations')
        .insert({
          donor_name,
          donor_email: donor_email || null,
          donor_phone: donor_phone || null,
          user_id: user_id || null,
          amount,
          currency: currency || 'NGN',
          type: campaign_id ? 'campaign' : sponsorship_request_id ? 'sponsorship' : 'one-time',
          campaign_id: campaign_id || null,
          sponsorship_request_id: sponsorship_request_id || null,
          status: 'pending',
          flutterwave_ref: flw_ref,
        })
        .select()
        .single()

      if (error) throw error

      if (!flw_public_key) {
        return new Response(
          JSON.stringify({ error: 'Flutterwave not configured. Admin must set API keys in Site Settings.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ donation: data, flw_public_key, flw_ref }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verify') {
      if (!flw_secret_key) {
        return new Response(
          JSON.stringify({ error: 'Flutterwave not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const verifyRes = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        { headers: { Authorization: `Bearer ${flw_secret_key}` } }
      )
      const verifyData = await verifyRes.json()

      if (verifyData.status === 'success' && verifyData.data.status === 'successful') {
        // Update donation status
        const { data: donation } = await supabaseAdmin
          .from('donations')
          .update({
            status: 'completed',
            flutterwave_tx_id: String(transaction_id),
          })
          .eq('flutterwave_ref', tx_ref)
          .select()
          .single()

        // If campaign donation, increment raised_amount atomically
        if (donation?.campaign_id) {
          await supabaseAdmin.rpc('increment_campaign_raised', {
            _campaign_id: donation.campaign_id,
            _amount: donation.amount,
          }).catch(() => {
            // Fallback: direct update
            supabaseAdmin
              .from('donation_campaigns')
              .select('raised_amount')
              .eq('id', donation.campaign_id)
              .single()
              .then(({ data: camp }) => {
                if (camp) {
                  supabaseAdmin
                    .from('donation_campaigns')
                    .update({ raised_amount: (camp.raised_amount || 0) + donation.amount })
                    .eq('id', donation.campaign_id)
                }
              })
          })
        }

        // If sponsorship donation, auto-enroll the student
        if (donation?.sponsorship_request_id) {
          const { data: request } = await supabaseAdmin
            .from('student_sponsorship_requests')
            .select('student_user_id, course_id')
            .eq('id', donation.sponsorship_request_id)
            .single()

          if (request) {
            // Enroll the student
            await supabaseAdmin
              .from('enrollments')
              .insert({ user_id: request.student_user_id, course_id: request.course_id })
              .then(() => {})
              .catch(() => {}) // ignore duplicate

            // Update sponsorship request
            await supabaseAdmin
              .from('student_sponsorship_requests')
              .update({
                status: 'sponsored',
                sponsored_by_donation_id: donation.id,
              })
              .eq('id', donation.sponsorship_request_id)
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Donation verified successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        await supabaseAdmin
          .from('donations')
          .update({ status: 'failed' })
          .eq('flutterwave_ref', tx_ref)

        return new Response(
          JSON.stringify({ success: false, message: 'Payment verification failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
