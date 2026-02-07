import ExpoModulesCore
import GoogleSignIn
import UIKit

public class ExpoGoogleSigninModule: Module {
  private let signInErrorDomain = "com.google.GIDSignIn"
  private let canceledErrorCode = -5

  public func definition() -> ModuleDefinition {
    Name("ExpoGoogleSignIn")

    AsyncFunction("signIn") { (options: [String: Any], promise: Promise) in
      DispatchQueue.main.async {
        guard let serverClientId = options["serverClientId"] as? String, !serverClientId.isEmpty else {
          promise.reject(
            "INVALID_CONFIG",
            "serverClientId (Web OAuth client ID) is required in signIn options."
          )
          return
        }

        let iosClientId = (options["iosClientId"] as? String)
          ?? (Bundle.main.object(forInfoDictionaryKey: "GIDClientID") as? String)
        guard let iosClientId, !iosClientId.isEmpty else {
          promise.reject(
            "INVALID_CONFIG",
            "iosClientId is required for iOS. Provide it in signIn options or Info.plist (GIDClientID)."
          )
          return
        }

        guard let presentingViewController = self.topViewController() else {
          promise.reject("NO_VIEW_CONTROLLER", "No presenting view controller found.")
          return
        }

        GIDSignIn.sharedInstance.configuration = GIDConfiguration(
          clientID: iosClientId,
          serverClientID: serverClientId
        )

        GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController) { result, error in
          if let error = error as NSError? {
            if error.domain == self.signInErrorDomain &&
              error.code == self.canceledErrorCode {
              promise.reject("USER_CANCELED", "User canceled the sign-in flow.")
              return
            }
            promise.reject("SIGN_IN_ERROR", error.localizedDescription)
            return
          }

          guard
            let user = result?.user,
            let idToken = user.idToken?.tokenString,
            !idToken.isEmpty
          else {
            promise.reject("TOKEN_MISSING", "Failed to retrieve Google ID token.")
            return
          }

          let userMap: [String: Any] = [
            "id": user.userID ?? user.profile?.email ?? "",
            "idToken": idToken,
            "displayName": user.profile?.name ?? NSNull(),
            "givenName": user.profile?.givenName ?? NSNull(),
            "familyName": user.profile?.familyName ?? NSNull(),
            "profilePictureUrl": user.profile?.imageURL(withDimension: 256)?.absoluteString ?? NSNull(),
            "phoneNumber": NSNull()
          ]

          promise.resolve(userMap)
        }
      }
    }

    AsyncFunction("signOut") { (promise: Promise) in
      DispatchQueue.main.async {
        GIDSignIn.sharedInstance.signOut()
        promise.resolve(nil)
      }
    }
  }

  private func topViewController(
    base: UIViewController? = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first(where: \.isKeyWindow)?
      .rootViewController
  ) -> UIViewController? {
    if let navigationController = base as? UINavigationController {
      return topViewController(base: navigationController.visibleViewController)
    }
    if let tabBarController = base as? UITabBarController {
      return topViewController(base: tabBarController.selectedViewController)
    }
    if let presentedViewController = base?.presentedViewController {
      return topViewController(base: presentedViewController)
    }
    return base
  }
}
