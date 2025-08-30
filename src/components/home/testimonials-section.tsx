import TestimonialCard from "./testimonial-card"

export default function TestimonialsSection() {
  return (
    <section className="w-full py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="h-1 w-12 bg-primary mb-4"></div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Users Say</h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Hear from people who have transformed their financial management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            quote="Expanse Buddy AI has completely changed how I track my expenses. The recurring expense feature is a game-changer!"
            author="Sarah J."
            role="Product Manager"
          />
          <TestimonialCard
            quote="The budget allocation feature helps me stay on track every month. I can finally see where my money is going."
            author="Michael T."
            role="Software Engineer"
          />
          <TestimonialCard
            quote="Splitting bills with roommates used to be a nightmare. Now it's just a few taps away. Highly recommend!"
            author="Priya K."
            role="Graduate Student"
          />
        </div>
      </div>
    </section>
  )
}

