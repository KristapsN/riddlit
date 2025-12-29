"use client";

import { loadStripe } from "@stripe/stripe-js";
import React, { useEffect, useState } from "react";
import './styles.css'
import { getUser } from "@/lib/supabase/queries";
import { createClient } from '@/lib/supabase/client';
import { Box, Grid, TextField, Typography } from "@mui/material";
import { SignUpForm } from "@/components/sign-up-form";
import { Logo } from "@/helpers/logo";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

export default function PricingPage() {

  const [user, setUser] = React.useState('');

  useEffect(() => {
    const supabase = createClient();

    getUser(supabase).then(user => {
      return user?.email && setUser(user?.email);
    });
  }, []);

  // async function handleCheckout(mode: "subscription" | "one_time" | "free") {
  //   //     const supabase = await createClient();

  //   // const { data, error } = await supabase.auth.getUser();

  //   try {
  //     const res = await fetch("/api/stripe/create-checkout-session", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ mode, userEmail: user }),
  //     });

  //     const data = await res.json();
  //     if (data.error) {
  //       alert(data.error);
  //       return;
  //     }

  //     const stripe = await stripePromise;
  //     if (!stripe) throw new Error("Stripe failed to load");

  //     // Redirect to Checkout. Prefer sessionId if present otherwise open the returned url.
  //     const sessionId = data.url ? new URL(data.url).searchParams.get("session_id") : null;
  //     if (sessionId) {
  //       await stripe.redirectToCheckout({ sessionId });
  //     } else if (data.url) {
  //       window.location.href = data.url;
  //     } else {
  //       throw new Error("No checkout URL returned");
  //     }
  //   } catch (err: { message?: string } | any) {
  //     console.error(err);
  //     alert(err.message ?? String(err));
  //   }
  // }

  const [riddleName, setRiddleName] = useState('')

  return (
    <>
      <Grid container sx={{ flexGrow: 1, backgroundColor: '#FCD0F4', height: "100%" }}>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: "100%", marginLeft: '10px', marginRight: '10px' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '12rem',
                height: '10rem',
                background: '#f5f5f5'
              }}
            >
              {Logo}
            </Box>
            <Typography sx={{ textAlign: 'center', color: '#FCD0F4', background: '#000000ff', padding: '5px', marginBottom: '2px' }}>Crafted by solvers, for solvers. Design the riddles you'd love to crack.</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#FCD0F4', background: '#000000ff', padding: '5px' }}>The password </Typography>
              <Typography sx={{ textWrap: 'nowrap', color: '#fcf81bff', background: '#333333', padding: '10px', margin: '10px' }}>??RIDDLE?</Typography>
              <Typography sx={{ color: '#FCD0F4', background: '#000000ff', padding: '5px' }}> is fractured. Seek the missing characters within the Word Maze to mend the key.</Typography>
            </Box>

            <TextField
              value={riddleName}
              onChange={(e) => setRiddleName(e.target.value)}
              sx={{
                marginBottom: '10px',
                marginTop: '15px',
                backgroundColor: '#FCD0F4',
                border: '2px solid black',
                borderRadius: '4px',
                outlineColor: 'black',
              }}
              placeholder="??RIDDLE?"
            />
            <Box sx={{ margin: 2 }}>
              {riddleName === 'HIRIDDLER'
                ?
                <Box sx={{ width: { xs: '300px', md: '500px' } }}>
                  <SignUpForm />
                </Box>
                : <img src='/image.png' width={'500px'} />
              }
            </Box>

          </Box>
        </Grid>
      </Grid>
    </>
  );
}
