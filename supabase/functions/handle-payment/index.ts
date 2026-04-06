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
    const { action, course_id, user_id, amount, currency, tx_ref, transaction_id } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    if (action === 'initialize') {
      // Create a pending payment record
      const flw_ref = `SJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const { data, error } = await supabaseAdmin
        .from('payments')
        .insert({
          user_id,
          course_id,
          amount,
          currency: currency || 'NGN',
          status: 'pending',
          flutterwave_ref: flw_ref,
        })
        .select()
        .single()

      if (error) throw error

      // Get Flutterwave keys from secrets
      const flw_public_key = Deno.env.get('FLUTTERWAVE_PUBLIC_KEY')
      if (!flw_public_key) {
        return new Response(
          JSON.stringify({ error: 'Flutterwave not configured. Admin must set API keys.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ payment: data, flw_public_key, flw_ref }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verify') {
      const flw_secret_key = Deno.env.get('FLUTTERWAVE_SECRET_KEY')
      if (!flw_secret_key) {
        return new Response(
          JSON.stringify({ error: 'Flutterwave not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify transaction with Flutterwave
      const verifyRes = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        { headers: { Authorization: `Bearer ${flw_secret_key}` } }
      )
      const verifyData = await verifyRes.json()

      if (verifyData.status === 'success' && verifyData.data.status === 'successful') {
        // Update payment status
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'completed',
            flutterwave_tx_id: String(transaction_id),
            updated_at: new Date().toISOString(),
          })
          .eq('flutterwave_ref', tx_ref)

        // Enroll user in the course
        const { error: enrollError } = await supabaseAdmin
          .from('enrollments')
          .insert({ user_id, course_id })

        if (enrollError && !enrollError.message.includes('duplicate')) {
          throw enrollError
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Payment verified and enrolled' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        await supabaseAdmin
          .from('payments')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
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
