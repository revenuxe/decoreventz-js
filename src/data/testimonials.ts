import type { Testimonial } from "./types";
import { unsplash } from "./images";

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ananya R.",
    city: "Bangalore",
    quote: "The balloon arch looked even better than the reference photo. Setup was quick and tidy.",
    rating: 5,
    image: unsplash("womanPortrait1", 480, 854),
  },
  {
    id: "t2",
    name: "Karthik S.",
    city: "Mumbai",
    quote: "Booked our Haldi decor two days before the event — they still pulled off a stunning setup.",
    rating: 5,
    image: unsplash("manPortrait1", 480, 854),
  },
  {
    id: "t3",
    name: "Priya M.",
    city: "Hyderabad",
    quote: "Our baby shower backdrop was straight out of Pinterest. Every guest asked who did it.",
    rating: 5,
    image: unsplash("balloonWallPurplePink", 480, 854),
  },
  {
    id: "t4",
    name: "Rahul D.",
    city: "Pune",
    quote: "The proposal decor team kept everything a secret and nailed the surprise. She said yes!",
    rating: 5,
    image: unsplash("manPortrait2", 480, 854),
  },
];
