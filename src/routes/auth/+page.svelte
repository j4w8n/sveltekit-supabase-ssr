<script lang="ts">
  import { 
    resetPassword,
    signinAnonymously,
    signinEmail,
    signinMagicLink,
    signinOAuth,
    signinOtp,
    signupEmail,
    verifyOtp
  } from "./auth.remote.js"
  import * as s from "./auth.schemas.js";
  import * as f from "$lib/schema.fields.js"
  import * as v from "valibot"
</script>

<form {...signinEmail.preflight(s.signin_email)}>
  <!-- 
    this syntax takes care of the "name", "type", 
   "value" (in case of failed submission), and "aria-invalid" fields 
  -->
  <input 
    {...signinEmail.fields.email.as("email")}
    placeholder="email"
  >
  {#each signinEmail.fields.email.issues() as issue}
    <p style:color='red' style:width="250px">email: {issue.message}</p>
  {/each}

  <!-- prefix password with underscore so SvelteKit does not return this value -->
  <input 
    {...signinEmail.fields._password.as("password")}
    placeholder="password"
  >
  {#each signinEmail.fields._password.issues() as issue}
    <p style:color='red' style:width="250px">password: {issue.message}</p>
  {/each}
  <button style="margin-top: 12px;">Login</button>
</form>
<p style:color='red' style:width="250px">{signinEmail.result?.message}</p>

<form {...signupEmail.preflight(s.signup_email)}>
  <input 
    {...signupEmail.fields.email.as("email")}
    placeholder="email"
  >
  {#each signupEmail.fields.email.issues() as issue}
    <p style:color='red' style:width="250px">email: {issue.message}</p>
  {/each}

  <!-- prefix password with underscore so SvelteKit does not return this value -->
  <input 
    {...signupEmail.fields._password.as("password")}
    placeholder="password"
  >
  {#each signupEmail.fields._password.issues() as issue}
    <p style:color='red' style:width="250px">password: {issue.message}</p>
  {/each}
  <button style="margin-top: 12px;">Signup</button>
</form>
<p style:color='red' style:width="250px">{signupEmail.result?.message}</p>

<form {...signinOAuth}>
  <input {...signinOAuth.fields.provider.as("hidden", "github")}>
  <button style="margin-top: 12px;">Login with GitHub</button>
</form>
<p style:color='red' style:width="250px">{signinOAuth.result?.message}</p>

<form {...signinMagicLink.preflight(v.object({ email: f.email }))}>
  <input 
    {...signinMagicLink.fields.email.as("email")}
    placeholder="email"
  >
  {#each signinMagicLink.fields.email.issues() as issue}
    <p style:color='red' style:width="250px">email: {issue.message}</p>
  {/each}
  <button style="margin-top: 12px;">Login with magic link</button>
</form>
<p style:color='red' style:width="250px">{signinMagicLink.result?.message}</p>

<form {...signinOtp.preflight(v.object({ phone: v.string() }))}>
  <input 
    {...signinOtp.fields.phone.as("text")}
    placeholder="phone number"
  >
  {#each signinOtp.fields.phone.issues() as issue}
    <p style:color='red' style:width="250px">phone: {issue.message}</p>
  {/each}
  <button style="margin-top: 12px;">Login with phone OTP</button>
</form>
<p style:color='red' style:width="250px">{signinOtp.result?.message}</p>

<form {...signinAnonymously}>
  <button style="margin-top: 12px;">Login Anonymously</button>
</form>
<p style:color='red' style:width="250px">{signinAnonymously.result?.message}</p>

<form {...resetPassword.preflight(v.object({ email: f.email }))}>
  <input 
    {...resetPassword.fields.email.as("email")}
    placeholder="email"
  >
  {#each resetPassword.fields.email.issues() as issue}
    <p style:color='red' style:width="250px">email: {issue.message}</p>
  {/each}
  <button style="margin-top: 12px;">Reset Your Password</button>
</form>
<p style:color='red' style:width="250px">{resetPassword.result?.message}</p>

{#if verifyOtp.result?.verify || signinOtp.result?.verify}
  <form {...verifyOtp.preflight(v.object({ otp: f.otp, phone: f.phone }))}>
    <input 
      {...verifyOtp.fields.otp.as("text")}
    >
    {#each verifyOtp.fields.otp.issues() as issue}
    <p style:color='red' style:width="250px">password: {issue.message}</p>
  {/each}
    <input 
      {...verifyOtp.fields.phone.as("hidden", verifyOtp.result?.phone || signinOtp.result?.phone || "")}
    >
    <button style="margin-top: 12px;">Verify</button>
  </form>
  <p style:color='red' style:width="250px">{verifyOtp.result?.message}</p>
{/if}
