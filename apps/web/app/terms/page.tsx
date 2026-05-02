import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — TrendClips",
  description: "Terms of Service for TrendClips, a service operated by Pay4World.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl py-8 text-text-primary">
      <h1 className="mb-2 text-3xl font-bold">Terms of Service</h1>
      <p className="mb-8 text-sm text-text-secondary">Last updated: April 29, 2026</p>

      <div className="space-y-6 text-text-secondary leading-relaxed">
        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">1. Introduction</h2>
          <p>
            Welcome to TrendClips (&quot;we&quot;, &quot;us&quot;, or &quot;the Service&quot;), a video discovery
            service operated by TrendClips, a subsidiary of Pay4World. By accessing or using TrendClips, you agree to be
            bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use
            the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">2. YouTube Terms of Service</h2>
          <p>
            TrendClips uses YouTube API Services to retrieve and display publicly available video content from
            YouTube. <strong className="text-text-primary">By using TrendClips, you agree to be bound by the YouTube Terms of Service, available at{" "}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              https://www.youtube.com/t/terms
            </a></strong>. Any video content displayed on TrendClips is the property of its respective YouTube creators and
            is subject to YouTube&apos;s policies.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">3. Description of Service</h2>
          <p>
            TrendClips is a video discovery platform that aggregates trending YouTube clips and Shorts based on
            user-defined categories, topics, and search keywords. Videos are embedded via YouTube&apos;s official
            iframe player. We do not host, store, or modify any video content; all videos remain hosted on YouTube
            and are subject to YouTube&apos;s availability and policies.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">4. User Accounts</h2>
          <p>
            To create personalized video feeds, you may sign in using your Google account via Firebase Authentication.
            You are responsible for maintaining the confidentiality of your account and for all activities that occur
            under your account. You agree not to share your account credentials or use another user&apos;s account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>Use the Service for any unlawful purpose or in violation of YouTube&apos;s Terms of Service</li>
            <li>Attempt to scrape, copy, or redistribute content displayed on TrendClips</li>
            <li>Interfere with or disrupt the Service or its servers</li>
            <li>Attempt to gain unauthorized access to other users&apos; accounts or data</li>
            <li>Use automated means (bots, scrapers, etc.) to access the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">6. Content and Intellectual Property</h2>
          <p>
            All YouTube videos displayed on TrendClips are the intellectual property of their respective creators and
            YouTube. TrendClips claims no ownership over this content. The TrendClips name, logo, and platform design
            are the property of TrendClips and Pay4World.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">7. Disclaimers</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that videos
            will always be available, that content will be accurate, or that the Service will be uninterrupted or
            error-free. Video availability depends on YouTube and the original content creators.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, TrendClips and Pay4World shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to TrendClips at any time, without notice, for any
            reason, including violation of these Terms or YouTube&apos;s Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">10. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be reflected by updating the &quot;Last
            updated&quot; date at the top of this page. Continued use of the Service after changes constitutes
            acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">11. Contact</h2>
          <p>
            For questions about these Terms, please contact us at{" "}
            <a href="mailto:byunguk.yu@gmail.com" className="text-accent hover:underline">
              byunguk.yu@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">12. Related Policies</h2>
          <p>
            See also our{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
