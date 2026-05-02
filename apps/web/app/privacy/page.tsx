import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — TrendClips",
  description: "Privacy Policy for TrendClips, a service operated by Pay4World.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl py-8 text-text-primary">
      <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-8 text-sm text-text-secondary">Last updated: April 29, 2026</p>

      <div className="space-y-6 text-text-secondary leading-relaxed">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">1. Introduction</h2>
          <p>
            TrendClips (&quot;we&quot;, &quot;us&quot;, or &quot;the Service&quot;), a service operated by TrendClips, a
            subsidiary of Pay4World, is committed to protecting your privacy. This Privacy Policy explains what
            information we collect, how we use it, how we share it, and the choices you have regarding your information
            when you use TrendClips.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">2. Use of YouTube API Services</h2>
          <p>
            <strong className="text-text-primary">TrendClips uses YouTube API Services</strong> to discover, retrieve, and
            display YouTube video content. By using TrendClips, you acknowledge and agree to:
          </p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>
              The{" "}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                YouTube Terms of Service
              </a>
            </li>
            <li>
              The{" "}
              <a
                href="http://www.google.com/policies/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Google Privacy Policy
              </a>
            </li>
          </ul>
          <p className="mt-3">
            We use the YouTube Data API v3 to search for public videos and retrieve metadata such as video titles,
            thumbnails, view counts, and channel information. We do not access any private YouTube account data on your
            behalf.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">3. Information We Collect</h2>
          <p>We collect the following information:</p>

          <h3 className="mt-3 font-semibold text-text-primary">a) Account Information (when you sign in)</h3>
          <p>
            When you sign in with Google via Firebase Authentication, we receive your basic Google account profile:
          </p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>Display name</li>
            <li>Email address</li>
            <li>Profile picture URL</li>
            <li>Google account unique ID (UID)</li>
          </ul>

          <h3 className="mt-3 font-semibold text-text-primary">b) User-Generated Content</h3>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>Categories you create (name, description, language preference)</li>
            <li>Topics and search keywords you define</li>
            <li>Video voting and interaction data (upvotes, downvotes, favorites)</li>
            <li>Language preference (English or Korean)</li>
          </ul>

          <h3 className="mt-3 font-semibold text-text-primary">c) YouTube API Data</h3>
          <p>
            We retrieve and store public YouTube video metadata (video ID, title, thumbnail, view count, publication
            date, channel name) for videos matching your search topics. This data is refreshed periodically and
            automatically deleted after 30 days.
          </p>

          <h3 className="mt-3 font-semibold text-text-primary">d) Cookies and Local Storage</h3>
          <p>
            <strong className="text-text-primary">TrendClips uses cookies and local storage on your device</strong> for the
            following purposes:
          </p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>Firebase Authentication cookies and tokens to keep you signed in</li>
            <li>Browser localStorage to remember your language preference</li>
            <li>Session storage used by YouTube&apos;s embedded player</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">4. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>Provide, personalize, and improve the Service</li>
            <li>Authenticate you and maintain your account</li>
            <li>Build personalized video feeds based on the categories and topics you create</li>
            <li>Display your name and avatar in the Service&apos;s user interface</li>
            <li>Communicate with you about Service updates or support requests</li>
            <li>Monitor usage and prevent abuse, spam, or unauthorized access</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">5. How We Share Your Information</h2>
          <p>
            <strong className="text-text-primary">We do not sell or rent your personal information to third parties.</strong>{" "}
            We share information only as follows:
          </p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>
              <strong className="text-text-primary">Service providers:</strong> We use Google Firebase (Authentication,
              Firestore, Cloud Functions) to host and operate the Service, and Vercel for web hosting. These providers
              process data on our behalf under their own privacy policies.
            </li>
            <li>
              <strong className="text-text-primary">YouTube:</strong> Embedded YouTube videos are loaded directly from
              YouTube. YouTube may collect data via its embedded player according to its own privacy policy.
            </li>
            <li>
              <strong className="text-text-primary">Legal requirements:</strong> We may disclose information when
              required by law, court order, or to protect our rights and safety.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">6. Data Storage and Retention</h2>
          <p>
            Account data and user-generated content (categories, topics, favorites) are stored in Google Firestore for
            as long as your account is active. YouTube video metadata is automatically deleted from our database after
            30 days. You may request account deletion at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">7. Revoking Access and Deleting Data</h2>
          <p>
            You may revoke TrendClips&apos; access to your Google account at any time by visiting{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Google Account Permissions
            </a>
            . To request deletion of your TrendClips account and associated data, contact us at the email address
            below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">8. Children&apos;s Privacy</h2>
          <p>
            TrendClips is not directed at children under the age of 13. We do not knowingly collect personal information
            from children under 13. If you believe a child has provided us with personal information, please contact us
            and we will promptly delete it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">9. Security</h2>
          <p>
            We use industry-standard security measures provided by Google Firebase to protect your data. However, no
            method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be reflected by updating the
            &quot;Last updated&quot; date at the top of this page. Continued use of the Service after changes
            constitutes acceptance of the updated Policy.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">11. Contact Us</h2>
          <p>
            For questions about this Privacy Policy or our data practices, please contact us at{" "}
            <a href="mailto:byunguk.yu@gmail.com" className="text-accent hover:underline">
              byunguk.yu@gmail.com
            </a>
            .
          </p>
          <p className="mt-3">
            <strong className="text-text-primary">Operator:</strong> TrendClips, a subsidiary of Pay4World
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">12. Related Policies</h2>
          <p>
            See also our{" "}
            <Link href="/terms" className="text-accent hover:underline">
              Terms of Service
            </Link>
            ,{" "}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              YouTube Terms of Service
            </a>
            , and the{" "}
            <a
              href="http://www.google.com/policies/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Google Privacy Policy
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
