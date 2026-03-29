export const SITE_NAME = "12th Van";
export const SITE_TAGLINE = "Your 12th Man on the road to Chilifest.";
export const SITE_DESCRIPTION =
  "Affordable, sober rides between College Station and Snook for Chilifest 2026. Book your seat in 30 seconds.";

export const PRICE_ONE_WAY_CENTS = 3000;
export const PRICE_ROUND_TRIP_CENTS = 6000;

export const EVENT_DATES = {
  friday: "2026-04-10",
  saturday: "2026-04-11",
};

export const PICKUP_LOCATIONS = {
  to_snook: "Post Oak Mall — 1500 Harvey Rd, College Station",
  to_cstat: "Chilifest Grounds — FM 3058, Snook",
} as const;

export const DROPOFF_LOCATIONS = {
  to_snook: "Chilifest Grounds — FM 3058, Snook",
  to_cstat: "Post Oak Mall — 1500 Harvey Rd, College Station",
} as const;

export const COLORS = {
  maroon: "#500000",
  maroonDark: "#3C0000",
  maroonLight: "#6B0000",
  cream: "#FFF5E6",
  gold: "#D4A843",
} as const;

export const FAQ_ITEMS = [
  {
    question: "Where do I get picked up?",
    answer:
      "Rides to Chilifest depart from Post Oak Mall (1500 Harvey Rd, College Station). Rides back to College Station depart from the Chilifest grounds off FM 3058 in Snook.",
  },
  {
    question: "Can I bring a cooler?",
    answer:
      "Small personal coolers are fine as long as they fit on your lap or at your feet. No oversized coolers — we need room for everyone.",
  },
  {
    question: "What if I miss my ride?",
    answer:
      "If you miss your scheduled departure, check the app for the next available slot. We run rides continuously throughout the day. No refunds for missed rides.",
  },
  {
    question: "How many people fit in a vehicle?",
    answer:
      "It depends on the vehicle — our cars fit 4, trucks fit 4-5, and passenger vans fit up to 12. You'll see the capacity when you book.",
  },
  {
    question: "Is this an official shuttle service?",
    answer:
      "12th Van is an informal peer-to-peer cost-sharing arrangement organized by fellow Aggies. We are not a licensed Transportation Network Company (TNC). By booking, you acknowledge this and agree to our liability waiver.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Full refunds are available up to 24 hours before your scheduled ride. Within 24 hours, we offer a 50% refund. No refunds within 2 hours of departure or for no-shows.",
  },
  {
    question: "Are the drivers sober?",
    answer:
      "Absolutely. All 12th Van drivers commit to zero alcohol on event days. Your safety is our top priority.",
  },
];

export const LIABILITY_WAIVER = `ASSUMPTION OF RISK AND WAIVER OF LIABILITY

By booking a ride through 12th Van, you acknowledge and agree to the following:

1. INFORMAL ARRANGEMENT: 12th Van is a peer-to-peer, informal cost-sharing transportation arrangement organized by private individuals. 12th Van is NOT a licensed Transportation Network Company (TNC), taxi service, or commercial carrier.

2. ASSUMPTION OF RISK: You voluntarily assume all risks associated with riding in a privately owned vehicle, including but not limited to risks of traffic accidents, vehicle mechanical failure, weather conditions, and other hazards of road travel.

3. WAIVER OF LIABILITY: You hereby release and hold harmless 12th Van, its organizers, drivers, and affiliates from any and all claims, damages, losses, or liabilities arising from or related to your use of this service, to the fullest extent permitted by Texas law.

4. PERSONAL RESPONSIBILITY: You are responsible for your own safety and conduct during the ride. Seatbelts must be worn at all times. The driver reserves the right to refuse service to anyone who is excessively intoxicated, disruptive, or poses a safety risk.

5. NO GUARANTEE: While we strive for punctual departures, 12th Van does not guarantee exact departure or arrival times. Delays may occur due to traffic, weather, or other circumstances beyond our control.

6. AGE REQUIREMENT: You confirm that you are at least 18 years of age.

By checking the box below and completing your booking, you confirm that you have read, understood, and agree to these terms.`;
