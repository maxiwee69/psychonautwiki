import UIKit
import WebKit

class RootViewController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Psychonaut Wiki"
        
        let webConfiguration = WKWebViewConfiguration()
        webView = WKWebView(frame: view.bounds, configuration: webConfiguration)
        webView.navigationDelegate = self
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(webView)

        if let htmlPath = Bundle.main.path(forResource: "index", ofType: "html") {
            let directoryURL = URL(fileURLWithPath: htmlPath).deletingLastPathComponent()
            let htmlURL = URL(fileURLWithPath: htmlPath)

            webView.loadFileURL(htmlURL, allowingReadAccessTo: directoryURL)
        } else {
            print("Could not find HTML file in bundle")
            webView.loadHTMLString("<html><body><h1>Error loading HTML file</h1></body></html>", baseURL: nil)
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("Web view finished loading")
    }
}
