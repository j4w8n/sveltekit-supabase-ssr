<script lang="ts">
  import { 
    resetPassword,
    signinAnonymously,
    signinEmail,
    signinMagicLink,
    signinOAuth,
    signinOtp,
    signup,
    verifyOtp
  } from "./auth.remote.js"
</script>

<form {...signinEmail}>
  <input 
    name="email" 
    placeholder="email" 
    type="email" 
    value={signinEmail.input?.email} 
    aria-invalid={!!signinEmail.issues?.email}
  >
  <!-- prefix password with underscore so SvelteKit does not return this value -->
  <input 
    name="_password" 
    placeholder="password" 
    type="password" 
    aria-invalid={!!signinEmail.input?._password}
  >
  <button style="margin-top: 12px;">Login</button>
  <button {...signup.buttonProps} style="margin-top: 12px;">Signup</button>
</form>
<p style:color='red'>{signinEmail.result?.message || signup.result?.message }</p>

<form {...signinOAuth}>
  <input name="provider" type="hidden" value="github">
  <button style="margin-top: 12px;">Login with GitHub</button>
</form>
<p style:color='red'>{signinOAuth.result?.message }</p>

<form {...signinMagicLink}>
  <input 
    name="email" 
    placeholder="email" 
    type="email" 
    value={signinMagicLink.input?.email} 
    aria-invalid={!!signinMagicLink.issues?.email}
  >
  <button style="margin-top: 12px;">Login with magic link</button>
</form>
<p style:color='red'>{signinMagicLink.result?.message }</p>

<form {...signinOtp}>
  <input 
    name="phone" 
    placeholder="phone number" 
    type="text" 
    value={signinOtp.input?.phone} 
    aria-invalid={!!signinOtp.issues?.phone}
  >
  <button style="margin-top: 12px;">Login with phone OTP</button>
</form>
<p style:color='red'>{signinOtp.result?.message }</p>

<form {...signinAnonymously}>
  <button style="margin-top: 12px;">Login Anonymously</button>
</form>
<p style:color='red'>{signinAnonymously.result?.message }</p>

<form {...resetPassword}>
  <input 
    name="email" 
    placeholder="email" 
    type="email" 
    value={resetPassword.input?.email} 
    aria-invalid={!!resetPassword.issues?.email}
  >
  <button style="margin-top: 12px;">Reset Your Password</button>
</form>
<p style:color='red'>{resetPassword.result?.message }</p>

{#if signinOtp.result?.verify || verifyOtp.result?.verify }
  <form {...verifyOtp}>
    <input 
      name="otp" 
      placeholder={`OTP sent to ${signinOtp.result?.phone}`} 
      type="text" 
      value={verifyOtp.input?.otp} 
      aria-invalid={!!verifyOtp.issues?.otp}
    >
    <input 
      name="phone" 
      type="hidden" 
      value={signinOtp.result?.phone} 
    >
    <button style="margin-top: 12px;">Verify</button>
  </form>
  <p style:color='red'>{verifyOtp.result?.message}</p>
{/if}
