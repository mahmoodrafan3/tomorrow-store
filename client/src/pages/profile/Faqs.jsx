import SettingsShell from './SettingsShell';

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Orders are dispatched within 24 hours and usually arrive in 3–6 working days, depending on your pincode. You can check an estimate on any product page using "Check for Delivery Details".',
  },
  {
    q: 'What is your returns policy?',
    a: 'Unworn items with tags can be returned within 7 days of delivery. Start a return from your order history and we will arrange a pickup.',
  },
  {
    q: 'How do I find my size?',
    a: 'Every product page lists available sizes plus the fabric and fit notes in "About this piece". Our garments are cut for a relaxed, oversized silhouette — size down for a closer fit.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'Cash on Delivery is available on all orders right now. Online payments will be added soon.',
  },
  {
    q: 'How do coupon codes work?',
    a: 'Enter your code in the Order Summary at checkout and press Apply. The discount is validated on our servers before the order is placed, so a code that stops qualifying will be rejected.',
  },
  {
    q: 'Can I change or cancel an order?',
    a: 'Orders can be cancelled while they are still pending. Once an order is marked shipped it can no longer be changed — please start a return instead.',
  },
  {
    q: 'How do I write a review?',
    a: 'Sign in, open any product and use the "Write a review" box below the description. You can leave one review per product.',
  },
  {
    q: 'How do I contact support?',
    a: 'Email support@tomorrow.com and we will reply within one working day.',
  },
];

export default function Faqs() {
  return (
    <SettingsShell title="Browse FAQs" subtitle="Answers to the questions we get most.">
      <div className="faq-list">
        {FAQS.map((f) => (
          <details className="faq-item" key={f.q}>
            <summary className="faq-q">
              {f.q}
              <span className="faq-chevron" aria-hidden="true">+</span>
            </summary>
            <p className="faq-a">{f.a}</p>
          </details>
        ))}
      </div>
    </SettingsShell>
  );
}
