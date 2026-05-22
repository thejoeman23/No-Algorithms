//
//  ViewController.swift
//  Shared (App)
//
//  Created by Jonathan Strong on 2026-05-17.
//

import WebKit

#if os(iOS)
import UIKit
import SafariServices
import ObjectiveC
typealias PlatformViewController = UIViewController
#elseif os(macOS)
import Cocoa
import SafariServices
typealias PlatformViewController = NSViewController
#endif

let extensionBundleIdentifier = "com.yourCompany.No-Algorithms.Extension"

class ViewController: PlatformViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self

#if os(iOS)
        self.webView.scrollView.isScrollEnabled = false
#endif

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
#if os(iOS)
        webView.evaluateJavaScript("show('ios')")
#elseif os(macOS)
        webView.evaluateJavaScript("show('mac')")

        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                if #available(macOS 13, *) {
                    webView.evaluateJavaScript("show('mac', \(state.isEnabled), true)")
                } else {
                    webView.evaluateJavaScript("show('mac', \(state.isEnabled), false)")
                }
            }
        }
#endif
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let message = message.body as? String else {
            return
        }

#if os(iOS)
        if message != "open-safari-settings" {
            return
        }

        if openSafariExtensionSettings() {
            return
        }

        openFallbackSafariSettings()
#elseif os(macOS)
        if message != "open-preferences" {
            return
        }

        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            guard error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                NSApp.terminate(self)
            }
        }
#endif
    }

#if os(iOS)
    private func openFallbackSafariSettings() {
        let urlString: String
        if #available(iOS 18.3, *) {
            urlString = UIApplication.openDefaultApplicationsSettingsURLString
        } else {
            urlString = "App-Prefs:root=SAFARI"
        }

        if let url = URL(string: urlString) {
            UIApplication.shared.open(url)
        }
    }

    private func openSafariExtensionSettings() -> Bool {
        guard #available(iOS 26.0, *) else {
            let version = ProcessInfo.processInfo.operatingSystemVersion
            NSLog("Safari extension settings API requires iOS 26.0+. Current iOS version: \(version.majorVersion).\(version.minorVersion).\(version.patchVersion)")
            return false
        }

        guard let settingsClass = NSClassFromString("SFSafariSettings") else {
            NSLog("SFSafariSettings class is not available on this runtime.")
            return false
        }

        let selector = NSSelectorFromString("openExtensionsSettingsForIdentifiers:completionHandler:")
        guard let method = class_getClassMethod(settingsClass, selector) else {
            NSLog("SFSafariSettings.openExtensionsSettings(forIdentifiers:) is not available on this runtime.")
            return false
        }

        let implementation = method_getImplementation(method)
        typealias OpenExtensionsSettings = @convention(c) (
            AnyClass,
            Selector,
            NSArray,
            (@convention(block) (NSError?) -> Void)?
        ) -> Void

        let openSettings = unsafeBitCast(implementation, to: OpenExtensionsSettings.self)
        openSettings(settingsClass, selector, [extensionBundleIdentifier] as NSArray) { error in
            if let error {
                NSLog("Unable to open Safari extension settings: \(error)")
                DispatchQueue.main.async {
                    self.openFallbackSafariSettings()
                }
            }
        }

        return true
    }
#endif
}
