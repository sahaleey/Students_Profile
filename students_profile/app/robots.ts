import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/launch"],
      disallow: ["/admin/", "/student/", "/usthad/", "/staff/", "/hisan/"],
    },
    sitemap: "https://nahj-studentsprofile.vercel.app/sitemap.xml",
  };
}
