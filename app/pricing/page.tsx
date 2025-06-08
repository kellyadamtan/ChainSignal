import Link from "next/link"
import { Button } from "@/components/ui/button"

const tiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Get started with our basic features.",
    features: ["Basic analytics", "Up to 100 requests per month", "Community support"],
    cta: "Sign Up",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    description: "Unlock advanced features for your growing business.",
    features: ["Advanced analytics", "Unlimited requests", "Priority support", "Custom integrations"],
    cta: "Upgrade to Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Contact us",
    description: "Custom solutions tailored to your specific needs.",
    features: ["Dedicated support", "Custom SLAs", "Advanced security features", "Dedicated account manager"],
    cta: "Contact us",
  },
]

export default function PricingPage() {
  return (
    <div className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Choose the plan that's right for you. No hidden fees, upgrade or downgrade at any time.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.id} className="flex flex-col justify-between rounded-3xl bg-gray-50 p-8 shadow-xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
                <p className="mt-4 text-5xl font-bold tracking-tight text-gray-900">{tier.price}</p>
                <p className="mt-2 text-gray-600">{tier.description}</p>
                <ul role="list" className="mt-6 space-y-3 text-sm text-gray-600">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg
                        className="h-5 w-5 flex-none text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 6a.75.75 0 01-1.051 0l-4.5-4.5a.75.75 0 011.06-1.06l3.976 3.975 7.444-5.653a.75.75 0 011.052-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                {tier.cta && (
                  <Button className="w-full" variant={tier.id === "enterprise" ? "default" : "outline"} asChild>
                    <Link href={`/signup?plan=${tier.id}`}>{tier.cta}</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
