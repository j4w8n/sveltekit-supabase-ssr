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
    value={signinEmail.input?.email || signup.input?.email} 
    aria-invalid={!!signinEmail.issues?.email || !!signup.issues?.email}
  >
  <!-- prefix password with underscore so SvelteKit does not return this value -->
  <input 
    name="_password" 
    placeholder="password" 
    type="password" 
    aria-invalid={!!signinEmail.input?._password || !!signup.input?._password}
  >
  <button style="margin-top: 12px;">Login</button>
  <button {...signup.buttonProps} style="margin-top: 12px;">Signup</button>
</form>
{#if signinEmail.issues}
  {#each signinEmail.issues.email as issue}
    <p style:color='red' style:width="250px">{issue.message} email</p>
  {/each}
  {#each signinEmail.issues._password as issue}
    <p style:color='red' style:width="250px">{issue.message} password</p>
  {/each}
{:else if signinEmail.result}
  <p style:color='red' style:width="250px">{signinEmail.result?.message} result</p>
{/if}
{#if signup.issues}
  {#each signup.issues.email as issue}
    <p style:color='red' style:width="250px">{issue.message}</p>
  {/each}
  {#each signup.issues._password as issue}
    <p style:color='red' style:width="250px">{issue.message}</p>
  {/each}
{:else if signup.result?.message}
  <p style:color='red' style:width="250px">{signup.result?.message}</p>
{/if}

<form {...signinOAuth}>
  <input name="provider" type="hidden" value="github">
  <button style="margin-top: 12px;">Login with GitHub</button>
</form>
{#if signinOAuth.issues?.provider}
  {#each signinOAuth.issues.provider as issue}
    <p style:color='red' style:width="250px">{issue.message}</p>
  {/each}
{:else if signinOAuth.result?.message}
  <p style:color='red' style:width="250px">{signinOAuth.result?.message}</p>
{/if}

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
<p style:color='red' style:width="250px">{signinMagicLink.result?.message}</p>

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
<p style:color='red' style:width="250px">{signinOtp.result?.message}</p>

<form {...signinAnonymously}>
  <button style="margin-top: 12px;">Login Anonymously</button>
</form>
<p style:color='red' style:width="250px">{signinAnonymously.result?.message}</p>

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
<p style:color='red' style:width="250px">{resetPassword.result?.message}</p>

{#if signinOtp.result?.verify || verifyOtp.result?.verify}
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
  <p style:color='red' style:width="250px">{verifyOtp.result?.message}</p>
{/if}
