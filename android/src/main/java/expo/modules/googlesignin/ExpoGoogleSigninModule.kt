package expo.modules.googlesignin

import android.app.Activity
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CustomCredential
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ExpoGoogleSigninModule : Module() {

  private var serverClientId: String? = null
  private var filterByAuthorizedAccounts: Boolean = true
  private var useSignInWithGoogleOption: Boolean = true

  override fun definition() = ModuleDefinition {
    Name("ExpoGoogleSignIn")

    AsyncFunction("configure") { config: Map<String, Any?> ->
      serverClientId = (config["serverClientId"] as? String)?.ifBlank { null }
        ?: throw IllegalArgumentException("serverClientId (Web OAuth client ID) is required")
      filterByAuthorizedAccounts = (config["filterByAuthorizedAccounts"] as? Boolean) ?: true
      useSignInWithGoogleOption = (config["useSignInWithGoogleOption"] as? Boolean) ?: true
    }

    AsyncFunction("signIn") { options: Map<String, Any?>, promise: Promise ->
      val activity = requireActivity()
      val cm = CredentialManager.create(activity)

      val nonce = options["nonce"] as? String
      val requestVerifiedPhone = (options["requestVerifiedPhoneNumber"] as? Boolean) ?: false
      val preferImmediate = (options["preferImmediatelyAvailableCredentials"] as? Boolean) ?: false

      val opt = if (useSignInWithGoogleOption) {
        val b = GetSignInWithGoogleOption.Builder(serverClientId!!)
        if (nonce != null) b.setNonce(nonce)
        b.build()
      } else {
        val b = GetGoogleIdOption.Builder()
          .setServerClientId(serverClientId!!)
          .setFilterByAuthorizedAccounts(filterByAuthorizedAccounts)
          .setRequestVerifiedPhoneNumber(requestVerifiedPhone)
        if (nonce != null) b.setNonce(nonce)
        b.build()
      }

      val request = GetCredentialRequest.Builder()
        .addCredentialOption(opt)
        .setPreferImmediatelyAvailableCredentials(preferImmediate)
        .build()

      CoroutineScope(Dispatchers.Main).launch {
        try {
          val result = cm.getCredential(activity, request)
          val cred = result.credential

          if (cred is CustomCredential &&
            cred.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
          ) {
            val g = GoogleIdTokenCredential.createFrom(cred.data)
            val resultMap = mapOf(
              "id" to g.id,
              "idToken" to g.idToken,
              "displayName" to g.displayName,
              "givenName" to g.givenName,
              "familyName" to g.familyName,
              "profilePictureUrl" to (g.profilePictureUri?.toString()),
              "phoneNumber" to g.phoneNumber
            )
            promise.resolve(resultMap)
          } else {
            promise.reject("UNEXPECTED_CREDENTIAL_TYPE", "Unexpected credential type: ${cred.type}", null)
          }
        } catch (e: GetCredentialException) {
          promise.reject("GET_CREDENTIAL_ERROR", e.message, e)
        }
      }
    }

    AsyncFunction("signOut") { promise: Promise ->
      val activity = requireActivity()
      val cm = CredentialManager.create(activity)

      CoroutineScope(Dispatchers.Main).launch {
        try {
          cm.clearCredentialState(ClearCredentialStateRequest())
          promise.resolve(null)
        } catch (e: Exception) {
          promise.reject("CLEAR_CREDENTIAL_ERROR", e.message, e)
        }
      }
    }
  }

  private fun requireActivity(): Activity {
    return appContext.activityProvider?.currentActivity
      ?: throw IllegalStateException("No current Activity. Call from foreground.")
  }
}