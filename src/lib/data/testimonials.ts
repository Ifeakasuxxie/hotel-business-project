export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Business Traveler",
    quote:
      "An exceptional stay from start to finish. The attention to detail, the warmth of the staff, and the quality of the rooms made this one of the best hotel experiences I have ever had.",
    rating: 5,
    avatar: "SM",
  },
  {
    id: "2",
    name: "James Adewale",
    role: "Family Vacation",
    quote:
      "Our family had an unforgettable holiday. The pool facilities kept the children entertained for hours, and the dining options catered to everyone's tastes. We are already planning our return.",
    rating: 5,
    avatar: "JA",
  },
  {
    id: "3",
    name: "Priya Sharma",
    role: "Wedding Guest",
    quote:
      "We attended a wedding event here and were blown away by the venue, the catering, and the professional service. The event team ensured every detail was perfect.",
    rating: 5,
    avatar: "PS",
  },
];
