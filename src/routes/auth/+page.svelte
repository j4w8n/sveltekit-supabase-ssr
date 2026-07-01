<script lang="ts">
  let { form } = $props()

  const input =
    'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100'
  const btn =
    'rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500'
  const btnAlt =
    'rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50'
</script>

<div class="mx-auto max-w-md space-y-6">
  <div class="text-center">
    <h1 class="text-2xl font-bold text-slate-900">Sign in</h1>
    <p class="mt-1 text-sm text-slate-500">Choose a method to continue</p>
  </div>

  <div class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <form method="POST" action="?/signin_email" class="space-y-3">
      <input class={input} name="email" placeholder="email" type="email" value={form?.email ?? ''} />
      <input class={input} name="password" placeholder="password" type="password" />
      <div class="flex gap-2">
        <button class={btn}>Login</button>
        <button class={btnAlt} formaction="?/signup">Signup</button>
      </div>
    </form>

    <div class="border-t border-slate-100"></div>

    <form method="POST" action="?/oauth">
      <button class="{btnAlt} w-full" name="provider" value="github">Login with GitHub</button>
    </form>

    <form method="POST" action="?/magic" class="flex gap-2">
      <input class={input} name="email" placeholder="email" type="email" />
      <button class="{btnAlt} whitespace-nowrap">Magic link</button>
    </form>

    <form method="POST" action="?/signin_otp" class="flex gap-2">
      <input class={input} name="phone" placeholder="phone number" type="text" />
      <button class="{btnAlt} whitespace-nowrap">Phone OTP</button>
    </form>

    <form method="POST" action="?/anon">
      <button class="{btnAlt} w-full">Login Anonymously</button>
    </form>

    <form method="POST" action="?/reset" class="flex gap-2">
      <input class={input} name="email" placeholder="email" type="email" />
      <button class="{btnAlt} whitespace-nowrap">Reset Password</button>
    </form>
  </div>

  {#if form?.message}
    <p class="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{form.message}</p>
  {/if}
  {#if form?.error}
    <p class="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{form.error}</p>
  {/if}
  {#if form?.verify}
    <form method="POST" action="?/verify_otp" class="flex gap-2">
      <input class={input} name="otp" placeholder={`OTP sent to ${form?.phone}`} type="text" />
      <input name="phone" type="hidden" value={form?.phone} />
      <button class={btn}>Verify</button>
    </form>
  {/if}
</div>
