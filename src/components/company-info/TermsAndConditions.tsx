import { ServiceListProps } from "@/type/type";

const TermsAndConditions = () => {
  const serviceList: ServiceListProps[] = [
    {
      title: "Event Participation",
      descriptions: (
        <ul className="text-sm text-muted-foreground">
          <li>
            Event organizers reserve the right to modify the event schedule,
            content, or guest list without prior notice.
          </li>
          <li>
            Participants must adhere to all event rules, including but not
            limited to, dress code, professional conduct, and respect towards
            other attendees.
          </li>
          <li>
            Any form of harassment, discrimination, or disruptive behavior will
            not be tolerated and may result in immediate expulsion from the
            event.
          </li>
          <li>
            Attendees must follow all instructions provided by event staff and
            security personnel.
          </li>
          <li>
            Unauthorized solicitation, marketing, or distribution of materials
            is strictly prohibited.
          </li>
        </ul>
      ),
    },
    {
      title: "Payment Policies",
      descriptions: (
        <ul className="text-sm text-muted-foreground">
          <li>
            All payments for event participation must be made in accordance with
            the specified terms. Any failure to complete payment by the due date
            may result in automatic cancellation of your reservation without a
            refund.
          </li>
          <li>
            Refunds, if applicable, will only be processed in accordance with
            the stated refund policy. No refunds will be provided for
            cancellations made outside the specified timeframe.
          </li>
          <li>
            In the event of non-payment or chargeback disputes, Glowfish
            reserves the right to prohibit future participation and take legal
            action if necessary.
          </li>
          <li>
            Additional fees may apply for late registrations, special requests,
            or exclusive event perks.
          </li>
        </ul>
      ),
    },
    {
      title: "Space Usage",
      descriptions: (
        <ul className="text-sm text-muted-foreground">
          <li>
            Attendees must use the event space responsibly and comply with all
            venue regulations, including safety measures and capacity limits.
          </li>
          <li>
            Any damage caused to the property, equipment, or furniture will be
            the sole responsibility of the attendee. Attendees may be charged
            for repairs or replacements as determined by Glowfish.
          </li>
          <li>
            Noise levels must be kept at a respectful level. Any excessive
            noise, disruption, or unauthorized use of sound equipment will not
            be permitted.
          </li>
          <li>
            The consumption of outside food and beverages is strictly prohibited
            unless explicitly allowed by Glowfish management.
          </li>
          <li>
            Smoking, illegal substances, and unauthorized alcohol consumption
            are not permitted within the premises.
          </li>
          <li>
            Personal belongings should be kept secure at all times; Glowfish is
            not responsible for any lost, stolen, or damaged items.
          </li>
        </ul>
      ),
    },
    {
      title: "Enforcement and Penalties",
      descriptions: (
        <ul className="text-sm text-muted-foreground">
          <li>
            Violation of these Terms may result in immediate removal from the
            event without a refund.
          </li>
          <li>
            Serious violations, including but not limited to harassment,
            property damage, or non-compliance with payment policies, may lead
            to permanent bans from future Glowfish events.
          </li>
          <li>
            Glowfish reserves the right to involve legal authorities if any
            attendee engages in unlawful activities within the event space.
          </li>
          <li>
            Repeat offenders may be subject to legal action and financial
            penalties to recover damages or outstanding payments.
          </li>
        </ul>
      ),
    },
    {
      title: "Contact Information",
      descriptions: (
        <div>
          <p className="text-sm text-muted-foreground">
            For any inquiries or support, please contact us at:{" "}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Email: </strong>
            <a href="mailto:info@glowfishworkplace.com">
              info@glowfishworkplace.com
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Phone: </strong>02-109-9600
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Address: </strong>92/4, 2nd Floor Thani 2 Building, North
            Sathorn, Silom, Bangkok, Thailand 10500
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Welcome to Good Afterwork at Glowfish. These Terms of Service ("Terms")
        govern your participation in our event, payment policies, and space
        usage. By attending or using our services, you agree to comply with
        these Terms. Failure to adhere to these Terms may result in immediate
        removal from the event and possible restrictions on future
        participation.
      </p>

      {serviceList.map((list) => (
        <div className="space-y-2">
          <h2 className="text-base">{list.title}</h2>
          {list.descriptions}
        </div>
      ))}

      <p className="text-sm text-muted-foreground">
        By attending Good Afterwork at Glowfish, you acknowledge and agree to
        these Terms of Service. Non-compliance may result in penalties or
        exclusion from future events. Thank you for being a part of our
        community!
      </p>
    </div>
  );
};

export default TermsAndConditions;
