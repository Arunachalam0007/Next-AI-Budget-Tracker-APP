import HeroSection from "@/components/herosection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mt-40">
      {/* HeroSection */}
      <HeroSection />

      {/* StatsSection */}

      <section className="bg-blue-50 py-20">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4  gap-8">
          {statsData.map((stats, index) => (
            <div key={index} className="text-center">
              <h1 className="text-4xl  font-bold text-blue-600">
                {stats.value}
              </h1>
              <p className="text-gray-600">{stats.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FeaturesSection */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center font-bold">
            Everything you need to manage your finances
          </h2>
          <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-12 gap-8">
            {featuresData.map((feature, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4 pt-4">
                  <div>{feature.icon}</div>
                  <h1 className="text-xl font-semibold ">{feature.title}</h1>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center font-bold">How It Works</h2>
          <div className=" grid grid-cols-1 md:grid-cols-3 mt-12 gap-8">
            {howItWorksData.map((workdData, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-6 mx-auto">
                  {workdData.icon}
                </div>
                <h1 className="text-xl font-semibold mb-4">
                  {workdData.title}
                </h1>
                <p className="text-gray-600">{workdData.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center font-bold">
            Everything you need to manage your finances
          </h2>
          <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-12 gap-8">
            {testimonialsData.map((testimonialData, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-4">
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonialData.image}
                      alt={testimonialData.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">
                        {testimonialData.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {testimonialData.role}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{testimonialData.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl text-center font-bold text-white mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their finances
            smarter with Welth
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 animate-bounce "
            >
              Start Free Trail
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
