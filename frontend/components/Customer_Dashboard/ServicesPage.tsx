"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Inter } from "next/font/google";
import Lottie from "lottie-react";
import gemAnimation from "@/public/lottie/salon.json";
import {
  Search,
  Scissors,
  Sparkles,
  Clock,
  DollarSign,
  MapPin,
} from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  image?: string;
}

const API_URL =
  "http://ctse-alb-320060941.eu-north-1.elb.amazonaws.com/api/services";

// Random placeholder images based on service categories
const getRandomPlaceholder = (category: string) => {
  const images = {
    hair: [
      "https://images.unsplash.com/photo-1560869713-7d0a2943084e?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=500&h=300&fit=crop",
    ],
    nails: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1610992057159-36d9bd3e6c3b?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1596643228269-482a3b3b7ce4?w=500&h=300&fit=crop",
    ],
    skin: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=300&fit=crop",
    ],
    makeup: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=300&fit=crop",
    ],
    spa: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&h=300&fit=crop",
    ],
    default: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a0b9?w=500&h=300&fit=crop",
    ],
  };

  const categoryLower = category.toLowerCase();
  let imageArray = images.default;

  if (categoryLower.includes("hair")) imageArray = images.hair;
  else if (categoryLower.includes("nail")) imageArray = images.nails;
  else if (categoryLower.includes("skin")) imageArray = images.skin;
  else if (categoryLower.includes("makeup")) imageArray = images.makeup;
  else if (categoryLower.includes("spa")) imageArray = images.spa;

  // Return random image from array based on service name hash for consistency
  const hash = categoryLower
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % imageArray.length;
  return imageArray[index];
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔄 Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        withCredentials: true,
      });
      setServices(res.data?.data || []);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // 🔍 Search filter
  const filteredServices = services.filter(
    (s: Service) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleBook = (service: Service) => {
    console.log("Booking:", service);
    alert(`Booking ${service.name}`);
  };

  // Loading UI
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-screen bg-gray-900"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-24 h-24 sm:w-32 sm:h-32"
        >
          <Lottie animationData={gemAnimation} loop />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 p-4 md:p-6 ${inter.className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl text-gray-200 font-bold">
            Available Services
          </h1>
          <p className="text-md text-gray-400 mt-2">
            Discover our premium salon services tailored just for you
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services by name or category..."
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredServices.map((service: Service, index: number) => {
              const placeholderImage = getRandomPlaceholder(service.category);
              const imageUrl = service.image
                ? encodeURI(
                    `http://ctse-alb-320060941.eu-north-1.elb.amazonaws.com${service.image}`,
                  )
                : placeholderImage;

              return (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-700 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={service.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImage;
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-gray-900/80 backdrop-blur-sm text-gray-300 text-xs font-medium rounded-full border border-gray-600">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h2 className="text-xl font-semibold text-gray-200 line-clamp-1">
                      {service.name}
                    </h2>

                    <p className="text-sm text-gray-400 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Price and Duration */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-green-400 font-semibold text-lg">
                          Rs. {service.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400 text-sm">
                          {service.duration} min
                        </span>
                      </div>
                    </div>

                    {/* Book Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBook(service)}
                      className="w-full mt-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white py-2.5 rounded-2xl font-medium hover:from-gray-600 hover:to-gray-500 transition-all duration-300"
                    >
                      Book Now
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto border border-gray-700">
                <Scissors className="w-10 h-10 text-gray-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Services Found
            </h3>
            <p className="text-sm text-gray-500">
              {search
                ? "Try adjusting your search terms"
                : "Check back later for new services"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
