import { ServiceListProps } from "@/type/type 2";

const PrivacyPolicy = () => {
  const serviceList: ServiceListProps[] = [
    {
      title: "Information We Collect",
      descriptions: (
        <>
          <p className="text-sm text-muted-foreground">
            We may collect the following types of personal information when you
            register for or attend our event:
          </p>
          <ul className="text-sm text-muted-foreground">
            <li>
              Name, email address, phone number, and other contact details
            </li>
            <li>Payment information for event registration</li>
            <li>Photographs and video recordings during the event</li>
            <li>Feedback and survey responses</li>
            <li>Any other information voluntarily provided by you</li>
          </ul>
        </>
      ),
    },
    {
      title: "How We Use Your Information",
      descriptions: (
        <div>
          <p className="text-sm text-muted-foreground">
            Your information is used for the following purposes:
          </p>
          <ul className="text-sm text-muted-foreground">
            <li>To process event registration and payments</li>
            <li>
              To communicate event-related updates and promotional content
            </li>
            <li>To enhance and improve our events based on feedback</li>
            <li>To ensure the security and safety of all attendees</li>
            <li>
              To comply with legal obligations and enforce our terms of service
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Sharing Your Information",
      descriptions: (
        <div>
          <p className="text-sm text-muted-foreground">
            We do not sell or rent your personal data. However, we may share
            your information with:
          </p>
          <ul className="text-sm text-muted-foreground">
            <li>
              Third-party service providers assisting in event operations (e.g.,
              payment processors, marketing tools)
            </li>
            <li>
              Legal authorities if required by law or in case of security
              concerns
            </li>
            <li>Internal teams for event improvement and analytics</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Data Retention",
      descriptions: (
        <p className="text-sm text-muted-foreground">
          We retain your personal information only for as long as necessary to
          fulfill the purposes outlined in this policy. If you wish to have your
          data removed, please contact us.
        </p>
      ),
    },
    {
      title: "Your Rights and Choices",
      descriptions: (
        <div>
          <p className="text-sm text-muted-foreground">
            You have the following rights regarding your personal data:
          </p>
          <ul className="text-sm text-muted-foreground">
            <li>Access and review the information we hold about you</li>
            <li>Request correction or deletion of your personal data</li>
            <li>Withdraw consent for marketing communications at any time</li>
            <li>
              Object to certain processing activities, subject to applicable
              laws
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Data Security",
      descriptions: (
        <p className="text-sm text-muted-foreground">
          We take appropriate measures to safeguard your data against
          unauthorized access, loss, or misuse. However, no method of
          transmission over the internet is completely secure.
        </p>
      ),
    },
    {
      title: "Photography and Media Usage",
      descriptions: (
        <p className="text-sm text-muted-foreground">
          By attending Good Afterwork at Glowfish, you acknowledge and consent
          to the use of event photographs and videos for marketing and
          promotional purposes. If you do not wish to be photographed, please
          inform our staff in advance.
        </p>
      ),
    },
    {
      title: "Policy Updates",
      descriptions: (
        <p className="text-sm text-muted-foreground">
          We may update this Privacy Policy from time to time. Continued
          participation in our events constitutes acceptance of any changes.
        </p>
      ),
    },
    {
      title: "Contact Information",
      descriptions: (
        <div>
          <p className="text-sm text-muted-foreground">
            If you have any questions about this Privacy Policy or wish to
            exercise your rights, please contact us at:{" "}
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
        Glowfish values your privacy and is committed to protecting your
        personal data. This Privacy Policy outlines how we collect, use, store,
        and protect your information when you participate in Good Afterwork at
        Glowfish.
      </p>

      {serviceList.map((list) => (
        <div className="space-y-2">
          <h2 className="text-base">{list.title}</h2>
          {list.descriptions}
        </div>
      ))}

      <p className="text-sm text-muted-foreground">
        By registering for or attending Good Afterwork at Glowfish, you
        acknowledge and agree to this Privacy Policy.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
