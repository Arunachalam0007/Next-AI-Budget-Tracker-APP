import {
  Tailwind,
  pixelBasedPreset,
  Button,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

export default function EmailBudgetSendTemplate({
  userName = "arun",
  type = "budget-alert",
  data = {
    percentageUsed: 85,
    budgetAmount: 4000,
    totalExpenses: 3400,
  },
}) {
  if (type === "monthly-report") {
  }

  if (type === "budget-alert") {
    return (
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: "#007291",
              },
            },
          },
        }}
      >
        <div className="m-5">
          {/* <Preview className="text-3xl text-center  text-red-500">
            Budget Alert
          </Preview> */}
          <Body>
            <Container>
              <Heading className="text-center  text-green-500">
                Budget Alert
              </Heading>
              <Text>Hello {userName}</Text>
              <div className="flex items-center gap-2">
                <p>you've used</p>
                <p className="font-bold">{data?.percentageUsed?.toFixed(1)}%</p>
                <p>of your monthly badget</p>
              </div>

              <Section className="p-3 bg-gray-300 rounded-xl">
                <div className="m-3 p-4 bg-[#f9fafb] rounded-lg">
                  <Text className="text-xl font-bold">Budget Amount</Text>
                  <div className="flex items-center gap-2 text-red-800 animate-bounce">
                    <Text className="text-2xl">₹</Text>
                    <Text className="text-2xl">{data?.budgetAmount}</Text>
                  </div>
                </div>

                <div className="m-3 p-4 bg-[#f9fafb] rounded-lg">
                  <Text className="text-xl font-bold">Spend So Far</Text>
                  <div className="flex items-center gap-2 text-red-800 animate-bounce">
                    <Text className="text-2xl">₹</Text>
                    <Text className="text-2xl">{data?.totalExpenses}</Text>
                  </div>
                </div>

                <div className="m-3 p-4 bg-[#f9fafb] rounded-lg">
                  <Text className="text-xl font-bold">Remaining</Text>
                  <div className="flex items-center gap-2 text-red-800 animate-bounce">
                    <Text className="text-2xl">₹</Text>
                    <Text className="text-2xl">
                      {data?.budgetAmount - data?.totalExpenses}
                    </Text>
                  </div>
                </div>
              </Section>
            </Container>
          </Body>
        </div>
      </Tailwind>
    );
  }
}
