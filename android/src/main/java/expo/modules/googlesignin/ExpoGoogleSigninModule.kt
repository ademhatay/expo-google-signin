package expo.modules.googlesignin

import android.app.Activity
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CustomCredential
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import androidx.credentials.exceptions.GetCredentialCancellationException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ExpoGoogleSigninModule : Module() {

  override fun definition() = ModuleDefinition {
    Name("ExpoGoogleSignIn")

    /**
     * Sign in with Google using Credential Manager.
     * Supports both One-Tap flow and explicit "Sign in with Google" button flow.
     */
    AsyncFunction("signIn") { options: Map<String, Any?>, promise: Promise ->
      val activity = requireActivity()
      val credentialManager = CredentialManager.create(activity)

      val serverClientId = options["serverClientId"] as? String
      if (serverClientId.isNullOrBlank()) {
        promise.reject(
          "INVALID_CONFIG",
          "serverClientId (Web OAuth client ID) is required in signIn options.",
          null
        )
        return@AsyncFunction
      }

      val nonce = options["nonce"] as? String
      val filterByAuthorizedAccounts = (options["filterByAuthorizedAccounts"] as? Boolean) ?: true
      val preferImmediately = (options["preferImmediatelyAvailableCredentials"] as? Boolean) ?: false
      val signInButtonFlow = (options["signInButtonFlow"] as? Boolean) ?: false

      val credentialOption = if (signInButtonFlow) {
        val builder = GetSignInWithGoogleOption.Builder(serverClientId)
        if (nonce != null) builder.setNonce(nonce)
        builder.build()
      } else {
        val builder = GetGoogleIdOption.Builder()
          .setServerClientId(serverClientId)
          .setFilterByAuthorizedAccounts(filterByAuthorizedAccounts)

        if (preferImmediately) {
          builder.setAutoSelectEnabled(true)
          builder.setRequestVerifiedPhoneNumber(false)
        }

        if (nonce != null) builder.setNonce(nonce)
        builder.build()
      }

      val resolvedPreferImmediate = if (signInButtonFlow) false else preferImmediately

      val request = GetCredentialRequest.Builder()
        .addCredentialOption(credentialOption)
        .setPreferImmediatelyAvailableCredentials(resolvedPreferImmediate)
        .build()

      CoroutineScope(Dispatchers.Main).launch {
        try {
          val result = credentialManager.getCredential(activity, request)
          val credential = result.credential

          if (credential is CustomCredential &&
            credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
          ) {
            try {
              val googleCredential = GoogleIdTokenCredential.createFrom(credential.data)
              val resultMap = mapOf(
                "id" to googleCredential.id,
                "idToken" to googleCredential.idToken,
                "displayName" to googleCredential.displayName,
                "givenName" to googleCredential.givenName,
                "familyName" to googleCredential.familyName,
                "profilePictureUrl" to googleCredential.profilePictureUri?.toString(),
                "phoneNumber" to googleCredential.phoneNumber
              )
              promise.resolve(resultMap)
            } catch (e: GoogleIdTokenParsingException) {
              promise.reject("TOKEN_PARSE_ERROR", "Failed to parse Google ID token: ${e.message}", e)
            }
          } else {
            promise.reject(
              "UNEXPECTED_CREDENTIAL_TYPE",
              "Unexpected credential type: ${credential.type}",
              null
            )
          }
        } catch (e: GetCredentialException) {
          val (code, message) = when (e) {
            is NoCredentialException ->
              "NO_CREDENTIAL" to "No credentials available for sign-in."
            is GetCredentialCancellationException ->
              "USER_CANCELED" to "User canceled the sign-in flow."
            else ->
              "GET_CREDENTIAL_ERROR" to (e.message ?: "Unknown credential error.")
          }
          promise.reject(code, message, e)
        } catch (e: Exception) {
          promise.reject("UNKNOWN_ERROR", e.message ?: "Unknown error", e)
        }
      }
    }

    /**
     * Sign out from Google by clearing stored credential state.
     */
    AsyncFunction("signOut") { promise: Promise ->
      val activity = requireActivity()
      val credentialManager = CredentialManager.create(activity)

      CoroutineScope(Dispatchers.Main).launch {
        try {
          credentialManager.clearCredentialState(ClearCredentialStateRequest())
          promise.resolve(null)
        } catch (e: Exception) {
          promise.reject("CLEAR_CREDENTIAL_ERROR", e.message ?: "Sign out failed", e)
        }
      }
    }
  }

  private fun requireActivity(): Activity {
    return appContext.currentActivity ?: throw Exceptions.MissingActivity()
  }
}