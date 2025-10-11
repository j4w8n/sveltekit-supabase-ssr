<script>
  import { deleteUser } from "./admin.remote.js"
  import * as v from "valibot"
</script>

<h2>Welcome to /admin!</h2>
<p>We're not doing any role checks for access to this page. 
  This is so you can see the results of remote function checks when trying to delete a user. 
  In a production environment, you'd only want admins to be able to access this page.
</p>
<form {...deleteUser.preflight(v.object({ user: v.string() }))}>
  Delete a user by ID:
  <input {...deleteUser.fields.user.as("text")}>
  {#each deleteUser.fields.user.issues() as issue}
    <p style:color='red' style:width="250px">id: {issue.message}</p>
  {/each}
  <button style="margin-top: 12px;">Delete</button>
</form>
<p style="color: red;">{deleteUser.result?.message}</p>
