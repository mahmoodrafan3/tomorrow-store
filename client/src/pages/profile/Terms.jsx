import SettingsShell from './SettingsShell';

const SECTIONS = [
  {
    title: 'Terms of Service',
    body: [
      'By placing an order on Tomorrow you confirm that the details you provide are accurate and that you are able to enter into a binding contract.',
      'Prices are shown in Indian Rupees and include applicable taxes. We may update prices and product availability at any time before an order is confirmed.',
      'Coupon codes are single-use per account unless stated otherwise, cannot be combined, and may be withdrawn at any time. Discounts are recalculated and validated on our servers when the order is placed.',
    ],
  },
  {
    title: 'Shipping & Returns Policy',
    body: [
      'Orders are dispatched within 24 hours of confirmation. Delivery estimates are indicative and may vary by pincode.',
      'Items must be unworn, unwashed and have their original tags attached to qualify for a return within 7 days of delivery.',
      'Refunds are issued to the original payment method, or as store credit for Cash on Delivery orders, within 5–7 working days of inspection.',
    ],
  },
  {
    title: 'Privacy Policy',
    body: [
      'We collect only the information required to process your order: your name, email, phone number and delivery address.',
      'Passwords are stored as salted bcrypt hashes. We never store raw payment credentials.',
      'You can review and adjust how your data is used from the Privacy Centre, and request a copy of your data at any time.',
    ],
  },
  {
    title: 'License',
    body: [
      'The Tomorrow name, logo, artwork and product photography are the property of Tomorrow Brand and are protected by copyright.',
      'You may not reproduce, redistribute or use these assets commercially without written permission.',
      'This application is provided as-is for demonstration purposes, without warranty of any kind, express or implied.',
    ],
  },
];

export default function Terms() {
  return (
    <SettingsShell
      title="Terms, Policy & License"
      subtitle="The rules that apply when you shop with us."
    >
      <div className="terms-list">
        {SECTIONS.map((s) => (
          <section className="terms-block" key={s.title}>
            <h2 className="terms-heading">{s.title}</h2>
            {s.body.map((p) => (
              <p className="terms-para" key={p}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </SettingsShell>
  );
}
