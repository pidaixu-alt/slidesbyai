<script setup lang="ts">
const SITE = useSite()

useSeoMeta({
  title: `Privacy Policy — ${SITE.name}`,
  description: `How ${SITE.name} collects and uses data: hashed IPs for rate limits, generation text for the model, and billing via ${SITE.paymentProcessor}.`,
})
</script>

<template>
  <div class="wrap">
    <SiteHeader />

    <section class="section" style="padding-top: 20px">
      <h1 style="font-size: 30px">Privacy Policy</h1>
      <p class="legal-updated">Last updated: {{ SITE.policiesUpdated }}</p>

      <div class="legal-body">
        <p>
          {{ SITE.legalName }} (“{{ SITE.name }}”, “we”, “us”, or “our”) respects your privacy.
          This Privacy Policy explains how we collect, use, store, and share personal
          information when you use the {{ SITE.name }} Etsy listing optimization Service at
          {{ SITE.url }}, and the rights you may have under laws such as the GDPR and CCPA.
        </p>
        <p>
          Please read this Policy before using the Service. Using the Service means you have
          read and understood this Policy. We may update it from time to time; material changes
          will be announced on the site or by email at least 15 days in advance.
        </p>

        <h2>1. Data controller</h2>
        <ul>
          <li>Controller: the individual trading as {{ SITE.legalName }} (sole trader; not a registered company)</li>
          <li>Privacy email: {{ SITE.privacyEmail }}</li>
          <li>Support email: {{ SITE.supportEmail }}</li>
          <li>Registered business address: not applicable (no company entity)</li>
          <li>Data Protection Officer: not appointed</li>
        </ul>
        <p>
          Privacy requests go to {{ SITE.privacyEmail }}. We do not publish a home address.
        </p>

        <h2>2. Personal information we collect</h2>
        <h3>2.1 Information you provide</h3>
        <ul>
          <li>
            <strong>Account information</strong> (when you subscribe to Pro): email address and
            password (stored hashed). The free generator does not require an account.
          </li>
          <li>
            <strong>Product descriptions</strong> you paste so we can generate tags and titles.
          </li>
          <li>
            <strong>Payment information:</strong> transaction amount and payment status. We do
            not store full card numbers — card data is handled by our processor (Section 5).
          </li>
          <li>
            <strong>Support communications:</strong> emails or messages you send to us.
          </li>
        </ul>
        <h3>2.2 Information we collect automatically</h3>
        <ul>
          <li>
            <strong>Hashed IP address</strong> used to enforce the free daily generation limit.
            The hash is one-way; we do not store the raw IP for that purpose.
          </li>
          <li>
            <strong>Device and network data:</strong> browser type, approximate timezone, and
            standard request metadata.
          </li>
          <li>
            <strong>Usage and logs:</strong> pages visited, generation timestamps, error and
            performance logs.
          </li>
        </ul>
        <p>We do not collect precise location or use third-party social logins.</p>

        <h2>3. How we use personal information</h2>
        <table>
          <thead>
            <tr>
              <th>Purpose</th>
              <th>Legal basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Provide the generator and Pro features</td>
              <td>Performance of a contract</td>
            </tr>
            <tr>
              <td>Billing and payment</td>
              <td>Performance of a contract</td>
            </tr>
            <tr>
              <td>Customer support</td>
              <td>Contract / legitimate interests</td>
            </tr>
            <tr>
              <td>Service notices (billing, security, policy updates)</td>
              <td>Legitimate interests</td>
            </tr>
            <tr>
              <td>Security, abuse, and fraud prevention (including rate limits)</td>
              <td>Legitimate interests</td>
            </tr>
            <tr>
              <td>Product improvement (aggregated, de-identified where possible)</td>
              <td>Legitimate interests</td>
            </tr>
            <tr>
              <td>Legal compliance</td>
              <td>Legal obligation</td>
            </tr>
          </tbody>
        </table>
        <p>
          We do not send marketing emails unless you opt in. We may aggregate or de-identify
          data for statistics so it can no longer identify you.
        </p>

        <h2>4. Cookies and tracking</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Purpose</th>
              <th>Can be turned off</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Strictly necessary</td>
              <td>Session, security, and core Service functions</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Functional</td>
              <td>Preferences such as language, if enabled</td>
              <td>Yes (browser settings)</td>
            </tr>
          </tbody>
        </table>
        <p>
          We do not currently use advertising pixels or marketing cookies. We do not run
          Google Analytics. You can block non-essential cookies in your browser; the generator
          may still work.
        </p>

        <h2>5. Sharing and disclosure</h2>
        <p>
          We do not sell your personal information, including “sale” as defined under the CCPA.
          We share information only as follows:
        </p>
        <ul>
          <li>
            <strong>Service providers</strong> bound to confidentiality: hosting (Vercel),
            database (Supabase), and the language-model API ({{ SITE.llmProvider }}) that
            processes product descriptions solely to return tags and titles.
          </li>
          <li>
            <strong>Payments:</strong> card data is processed exclusively by our PCI-DSS
            compliant processor, <strong>{{ SITE.paymentProcessor }}</strong>, and is not stored
            on our servers.
          </li>
          <li>
            <strong>Legal:</strong> if required by law, court order, or a valid government request.
          </li>
          <li>
            <strong>Business transfers:</strong> in a merger or acquisition, with notice and
            continued protection.
          </li>
          <li><strong>With your consent</strong> for any other purpose.</li>
        </ul>

        <h2>6. Security</h2>
        <ul>
          <li>Transport encryption: TLS / HTTPS.</li>
          <li>Passwords and IP-based rate-limit identifiers stored hashed.</li>
          <li>Access limited to people who need it to operate the Service.</li>
        </ul>
        <p>
          If a security incident is likely to affect your rights, we will notify you and any
          required regulator without undue delay, and within 72 hours where the law requires
          it. Keep your credentials private.
        </p>

        <h2>7. Retention</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Retention</th>
              <th>Afterward</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Account information</td>
              <td>While the account is active, then 90 days after cancellation</td>
              <td>Delete or anonymize</td>
            </tr>
            <tr>
              <td>Generation records / hashed IP counters</td>
              <td>As needed for daily limits and abuse prevention, typically up to 90 days</td>
              <td>Delete or anonymize</td>
            </tr>
            <tr>
              <td>Transaction records</td>
              <td>Up to 7 years where tax or accounting rules require</td>
              <td>Delete or archive as required</td>
            </tr>
            <tr>
              <td>Support emails</td>
              <td>2 years</td>
              <td>Secure deletion</td>
            </tr>
            <tr>
              <td>Security logs</td>
              <td>12 months</td>
              <td>Secure deletion</td>
            </tr>
          </tbody>
        </table>

        <h2>8. Your rights</h2>
        <p>
          Email {{ SITE.privacyEmail }} to exercise the rights that apply to you. We aim to
          respond within 30 calendar days.
        </p>
        <table>
          <thead>
            <tr>
              <th>Right</th>
              <th>What it means</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>To be informed</td>
              <td>Know what we collect and why</td>
            </tr>
            <tr>
              <td>Access</td>
              <td>Receive a copy of your personal information</td>
            </tr>
            <tr>
              <td>Rectification</td>
              <td>Correct inaccurate or incomplete data</td>
            </tr>
            <tr>
              <td>Erasure</td>
              <td>Ask us to delete data in cases the law allows</td>
            </tr>
            <tr>
              <td>Restriction</td>
              <td>Ask us to pause processing in certain cases</td>
            </tr>
            <tr>
              <td>Portability</td>
              <td>Receive data in a machine-readable format</td>
            </tr>
            <tr>
              <td>Objection</td>
              <td>Object to processing based on legitimate interests or marketing</td>
            </tr>
            <tr>
              <td>Withdraw consent</td>
              <td>Where processing is based on consent</td>
            </tr>
          </tbody>
        </table>
        <p>
          You may also lodge a complaint with your local data-protection authority if you
          believe we have not handled your request properly.
        </p>

        <h2>9. Marketing</h2>
        <p>
          We do not send promotional mail unless you opt in. You can unsubscribe via the link
          in any such email or by contacting {{ SITE.supportEmail }}. Unsubscribing does not
          stop necessary service messages such as receipts, security alerts, or policy updates.
        </p>

        <h2>10. International transfers</h2>
        <p>
          Our hosting and subprocessors may process data in the United States and other
          countries (including Vercel, Supabase, {{ SITE.llmProvider }}, and
          {{ SITE.paymentProcessor }}). Where we transfer personal information out of a region
          that requires safeguards, we rely on appropriate mechanisms such as Standard
          Contractual Clauses and providers that offer a comparable level of protection.
        </p>

        <h2>11. Children</h2>
        <p>
          The Service is for users aged {{ SITE.minAge }} or older. We do not knowingly collect
          information from children under {{ SITE.minAge }}. If you believe a child has provided
          information, contact {{ SITE.privacyEmail }} and we will delete it.
        </p>

        <h2>12. Third-party links</h2>
        <p>
          The Service may link to third-party sites (including Etsy). This Policy covers only
          information we collect. We are not responsible for third-party practices.
        </p>

        <h2>13. Changes</h2>
        <p>
          For material changes, we will give at least 15 days’ notice on this site or by email
          and update the “Last updated” date. Continued use after the effective date means you
          accept the revised Policy.
        </p>

        <h2>14. Contact</h2>
        <ul>
          <li>Privacy: {{ SITE.privacyEmail }}</li>
          <li>Support: {{ SITE.supportEmail }}</li>
          <li>Operator: individual trading as {{ SITE.legalName }}</li>
        </ul>
        <p>
          This Policy is provided for transparency and Waffo / card-network review. It is not
          legal advice.
        </p>
        <p>{{ SITE.legalName }} · {{ SITE.url }}</p>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
