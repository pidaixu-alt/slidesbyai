<script setup lang="ts">
const SITE = useSite()

useSeoMeta({
  title: `Terms of Service — ${SITE.name}`,
  description: `Terms of Service for ${SITE.name}, an AI presentation generator at ${SITE.url}.`,
})
</script>

<template>
  <div class="wrap">
    <SiteHeader />

    <section class="section" style="padding-top: 20px">
      <h1 style="font-size: 30px">Terms of Service</h1>
      <p class="legal-updated">
        Last updated: {{ SITE.policiesUpdated }} · Version 1.0 ·
        {{ SITE.legalName }} · {{ SITE.url }}
      </p>

      <div class="legal-body">
        <h2>1. Acceptance of these Terms</h2>
        <p>
          Welcome to {{ SITE.legalName }} (“{{ SITE.name }}”, “we”, “us”, or “our”), an
          individual / sole trader operating under the {{ SITE.name }} brand. There is no
          separate company and no business registered address. These Terms of Service
          (“Terms”) govern your access to and use of our AI presentation tools —
          including slide outlines and downloadable presentation files generated from your topic —
          available at {{ SITE.url }} (the “Service”).
        </p>
        <p>
          By creating an account, subscribing to a paid plan, or otherwise using the Service,
          you confirm that you: (a) are at least {{ SITE.minAge }} years of age; (b) have read,
          understood, and agree to be bound by these Terms; (c) agree to our
          <NuxtLink to="/legal/privacy">Privacy Policy</NuxtLink>; and (d) are authorized to
          enter into this agreement on behalf of yourself or any organization you represent.
        </p>
        <p>
          If you do not agree to these Terms, do not use the Service. Continued use after an
          update constitutes acceptance of the revised Terms.
        </p>

        <h2>2. Description of the Service</h2>
        <h3>2.1 What we provide</h3>
        <p>
          {{ SITE.name }} is a digital software-as-a-service (SaaS) product that helps you
          create presentation decks from a short topic or brief. You describe what the deck is
          for and receive slide titles and bullet points you can edit, then download as a
          PowerPoint (.pptx) file on paid plans.
        </p>
        <h3>2.2 Instant digital delivery</h3>
        <p>
          The Service is an intangible digital product. Access is granted as soon as payment
          is confirmed (for Pro) or immediately for the free tier. Refund limits that apply
          because of this instant delivery are set out in Section 7.
        </p>
        <h3>2.3 Third-party AI models</h3>
        <p>
          Generations are produced using third-party AI model providers, currently
          {{ SITE.llmProvider }}. Availability and quality may be affected by those providers.
          We will communicate material outages when we are aware of them.
        </p>
        <h3>2.4 Third-party formats</h3>
        <p>
          Exports use standard presentation formats (such as .pptx). We are not affiliated
          with Microsoft, Google, or other presentation software vendors. You are responsible
          for how you use and share decks you create.
        </p>

        <h2>3. Accounts</h2>
        <p>
          The free tier does not require an account. Pro requires accurate account and billing
          information. You are responsible for keeping login credentials confidential and for
          all activity under your account.
        </p>
        <ul>
          <li>Notify {{ SITE.supportEmail }} immediately if you suspect unauthorized use.</li>
          <li>Do not share login credentials with third parties.</li>
          <li>Keep the email address used for billing current.</li>
        </ul>
        <p>
          If you register for an organization, you represent that you are authorized to bind
          that organization.
        </p>

        <h2>4. Plans (subscription)</h2>
        <p>
          We offer a free plan ({{ SITE.freePerDay }} presentation per day, up to
          {{ SITE.freeMaxPages }} slides per deck, watermark on exports, no signup) and paid
          subscriptions: Monthly (${{ SITE.plans.monthly.price }}), Quarterly
          (${{ SITE.plans.quarterly.price }}) and Annual (${{ SITE.plans.annual.price }}).
          Paid plans include {{ SITE.paidPerMonth }} presentations per calendar month, up to
          {{ SITE.paidMaxPages }} slides per deck, no watermark, and PPTX download. All paid
          plans include the same quota and features; they differ only in billing period and
          price. Current features and pricing are at
          <NuxtLink to="/pricing">{{ SITE.url }}/pricing</NuxtLink>.
        </p>
        <p>
          To protect the service from automated abuse, paid accounts are also subject to a
          fair-use ceiling of {{ SITE.paidMaxPerDay }} generations per day per user. Normal use
          stays well below this cap.
        </p>
        <p>
          We may change plan features or introduce new plans. Price changes follow Section 5.
        </p>

        <h2>5. Billing and payment</h2>
        <h3>5.1 Automatic renewal authorization</h3>
        <p>
          When you provide a payment method and subscribe to Pro, you expressly authorize
          {{ SITE.legalName }} to charge that payment method the then-current subscription fee
          on each billing cycle until you cancel under Section 6. This recurring authorization
          remains in effect until cancellation.
        </p>
        <p>
          Your subscription renews automatically at the end of each billing period unless you
          cancel. We will send a reminder before renewal of any annual plan (if offered).
        </p>
        <h3>5.2 Taxes</h3>
        <p>
          Prices are exclusive of applicable taxes (including VAT, GST, or sales tax) unless
          stated otherwise. We may collect taxes where required by law.
        </p>
        <h3>5.3 Payment processing</h3>
        <p>
          Payments are processed by {{ SITE.paymentProcessor }}. We do not store full payment
          card numbers on our servers.
        </p>

        <h2>6. Cancellation</h2>
        <h3>6.1 How to cancel</h3>
        <p>You may cancel Pro at any time by either of the following:</p>
        <ul>
          <li>
            Online (preferred): Account settings → Subscription → Cancel, or the customer
            billing portal provided at checkout by {{ SITE.paymentProcessor }}.
          </li>
          <li>
            Email: send a cancellation request from your registered email to
            {{ SITE.supportEmail }}.
          </li>
        </ul>
        <p>
          Cancellation takes effect immediately for future charges. We will send a confirmation
          email as soon as reasonably practicable (typically within 10 minutes of an online
          cancel, or within one business day of an email request).
        </p>
        <h3>6.2 Effect of cancellation</h3>
        <ul>
          <li>You keep Pro access until the end of the current paid period.</li>
          <li>You will not be charged for later billing periods.</li>
          <li>
            Account data is retained for 90 days after cancellation, then deleted as described
            in the Privacy Policy.
          </li>
        </ul>

        <h2>7. Refunds</h2>
        <h3>7.1 General rule</h3>
        <p>
          Because the Service is delivered instantly as a digital product, subscription fees
          are generally non-refundable except as set out below.
        </p>
        <h3>7.2 When we refund</h3>
        <ul>
          <li>
            <strong>7-day first-purchase guarantee.</strong> If this is your first Pro charge,
            you may request a full refund within 7 days of that charge.
          </li>
          <li>
            <strong>Duplicate charges.</strong> Billing errors that cause a duplicate charge
            are refunded in full.
          </li>
          <li>
            <strong>Verified outages over 72 hours.</strong> If we cause a continuous outage
            lasting more than 72 hours, we will offer a pro-rata refund or an extension.
          </li>
          <li>
            <strong>Legal rights.</strong> Mandatory withdrawal or refund rights (for example
            a 14-day cooling-off period where EU/UK consumer law applies) remain available
            where the law requires them.
          </li>
        </ul>
        <h3>7.3 How to request a refund</h3>
        <p>
          Email {{ SITE.billingEmail }} with your account email, transaction ID, and reason.
          We will acknowledge within 2 business days and process eligible refunds within 5–10
          business days to the original payment method.
        </p>
        <h3>7.4 Non-refundable</h3>
        <ul>
          <li>Used subscription periods, except as listed in Section 7.2.</li>
          <li>Annual plan fees requested more than 30 days after the first purchase (if we offer annual plans).</li>
          <li>Accounts closed for breach of these Terms or the acceptable use rules.</li>
        </ul>

        <h2>8. Billing disputes</h2>
        <p>
          If you believe a charge is wrong, email {{ SITE.billingEmail }} before filing a
          dispute with your bank. We will reply within 2 business days and resolve confirmed
          billing errors within 5 business days.
        </p>

        <h2>9. AI content and intellectual property</h2>
        <p>
          Subject to these Terms, AI output generated from your input (“Output”) is yours.
          You may use Output for any lawful purpose consistent with Section 10, including in
          your presentations, reports, and teaching materials.
        </p>
        <p>
          By submitting content (“Input”), you grant {{ SITE.legalName }} a limited,
          non-exclusive license to process that Input solely to provide the Service. We do
          not use your Input to train AI models without your explicit consent.
        </p>
        <p>
          The Service uses third-party AI providers, including {{ SITE.llmProvider }}. We do
          not guarantee a particular quality of Output and are not responsible for third-party
          model behavior. You must review Output before you publish it.
        </p>

        <h2>10. Acceptable use</h2>
        <p>You may use the Service only for lawful purposes, including creating presentations for work, school, or personal use.</p>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Generate unlawful, defamatory, harassing, or fraudulent content.</li>
          <li>Create or assist deepfakes intended to impersonate a real person or mislead viewers.</li>
          <li>Generate sexual content involving minors or otherwise violate child-protection laws.</li>
          <li>Create malware, phishing material, or attack tools.</li>
          <li>Infringe intellectual property or privacy rights of others.</li>
          <li>Bypass security, rate limits, or usage caps, or automate access without permission.</li>
          <li>Resell or sublicense access without our prior written approval.</li>
          <li>Violate applicable law or card-network rules.</li>
        </ul>
        <p>You also agree not to:</p>
        <ul>
          <li>
            Use Input, Output, or derived data to train, fine-tune, benchmark, distill, or
            otherwise build competing AI or machine-learning models.
          </li>
          <li>Scrape or harvest Output at scale for any purpose other than your own authorized use.</li>
          <li>
            Present AI Output as professional legal, medical, or financial advice from a
            licensed human.
          </li>
        </ul>

        <h2>11. Data, privacy, and security</h2>
        <p>
          Use of the Service is also governed by our
          <NuxtLink to="/legal/privacy">Privacy Policy</NuxtLink>
          ({{ SITE.url }}/legal/privacy). Payment card data is processed exclusively by our
          PCI-DSS compliant processor, {{ SITE.paymentProcessor }}, and is not stored on our
          servers. Account data is retained for 90 days after cancellation, then deleted.
        </p>

        <h2>12. Disclaimers and limitation of liability</h2>
        <p>
          THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE”, WITHOUT WARRANTIES OF ANY KIND,
          INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR ACCURACY OF AI
          OUTPUT.
        </p>
        <p>
          AI Output may be inaccurate, incomplete, or outdated. Do not treat it as legal,
          medical, financial, or other professional advice. Verify it before you act on it,
          including before you present or publish a deck.
        </p>
        <p>
          To the maximum extent permitted by law, {{ SITE.legalName }} is not liable for
          indirect, incidental, consequential, or punitive damages. Our total liability is
          limited to the amount you paid us in the 12 months before the claim.
        </p>

        <h2>13. Term and termination</h2>
        <p>
          These Terms apply while you use the Service. We may suspend or terminate an account
          for material breach, suspected fraud, or legal requirement. If we terminate other
          than for your breach, we will refund unused prepaid time on a pro-rata basis. You
          may request account deletion by emailing {{ SITE.supportEmail }}.
        </p>

        <h2>14. Governing law and disputes</h2>
        <p>
          These Terms are governed by the laws applicable to the individual operating
          {{ SITE.name }}. Before formal proceedings, email {{ SITE.supportEmail }} and
          attempt an informal resolution.
        </p>

        <h2>15. General</h2>
        <p>
          We may update these Terms. Material changes will be notified at least 14 days before
          they take effect, using the email on your account where we have one. Continued use
          after the effective date means you accept the update. If a provision is unenforceable,
          the rest remains in effect. These Terms and the Privacy Policy are the entire
          agreement between you and {{ SITE.legalName }} regarding the Service.
        </p>

        <h2>16. Contact</h2>
        <ul>
          <li>Support, billing, refunds, cancellation, legal, and security: {{ SITE.supportEmail }}</li>
          <li>Privacy requests: {{ SITE.privacyEmail }}</li>
        </ul>
        <p>
          Using the Service or checking “I agree” at checkout means you have read and agree to
          these Terms.
        </p>
        <p>
          Last updated: {{ SITE.policiesUpdated }} · {{ SITE.legalName }} · {{ SITE.url }}
        </p>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
