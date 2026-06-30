import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?
    private let privacyScreenTag = 99999

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = BridgeViewController()
        self.window = window
        window.makeKeyAndVisible()
    }

    func sceneWillResignActive(_ scene: UIScene) {
        guard let window = self.window else { return }
        if window.viewWithTag(privacyScreenTag) != nil { return }

        let coverView = UIView(frame: window.bounds)
        coverView.tag = privacyScreenTag
        coverView.backgroundColor = .white
        coverView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        let iconSize: CGFloat = 80
        let iconImageView = UIImageView(frame: CGRect(
            x: (window.bounds.width - iconSize) / 2,
            y: (window.bounds.height - iconSize) / 2,
            width: iconSize,
            height: iconSize
        ))
        iconImageView.autoresizingMask = [
            .flexibleTopMargin, .flexibleBottomMargin,
            .flexibleLeftMargin, .flexibleRightMargin
        ]
        iconImageView.contentMode = .scaleAspectFit
        iconImageView.layer.cornerRadius = 16
        iconImageView.clipsToBounds = true

        if let appIcon = UIImage(named: "AppIcon") {
            iconImageView.image = appIcon
        } else if let iconsDictionary = Bundle.main.infoDictionary?["CFBundleIcons"] as? [String: Any],
                  let primaryIconsDictionary = iconsDictionary["CFBundlePrimaryIcon"] as? [String: Any],
                  let iconFiles = primaryIconsDictionary["CFBundleIconFiles"] as? [String],
                  let lastIcon = iconFiles.last {
            iconImageView.image = UIImage(named: lastIcon)
        }

        coverView.addSubview(iconImageView)
        window.addSubview(coverView)
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        guard let window = self.window,
              let coverView = window.viewWithTag(privacyScreenTag) else { return }
        UIView.animate(withDuration: 0.2, animations: {
            coverView.alpha = 0
        }) { _ in
            coverView.removeFromSuperview()
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        NotificationCenter.default.post(name: .capacitorOpenURL, object: [
            "url": url
        ])
    }
}
