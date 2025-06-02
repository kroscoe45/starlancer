// src/lib/mockDataGenerator.ts
export interface MockDataConfig {
  websiteCount: number;
  minPagesPerWebsite: number;
  maxPagesPerWebsite: number;
  simulateProgress: boolean;
  progressSpeed: number; // milliseconds between updates
  artistNames?: string[];
  artMediums?: string[];
  artThemes?: string[];
  domains?: string[];
}

export interface MockApiData {
  [websiteUrl: string]: {
    scrape_job_started: number;
    scrape_job_finished: number;
    artist_name: string;
    art_mediums: string[];
    art_themes: string[];
    [pageUrl: string]: any;
  } & Record<string, any>;
}

// Unified data source interface
export interface UnifiedWebsiteData {
  website_domain: string;
  sitemap: Record<string, string[]>;
  last_updated: number;
  artist_name: string;
  art_mediums: string[];
  art_themes: string[];
  source: "aws" | "mock";
}

export class MockDataGenerator {
  private static readonly DEFAULT_ARTIST_NAMES = [
    "Elena Rodriguez",
    "Marcus Chen",
    "Aria Nakamura",
    "Diego Santos",
    "Zara Al-Mansouri",
    "Kai Thompson",
    "Sofia Petrov",
    "Amara Okafor",
    "Luca Rossi",
    "Maya Patel",
    "Felix Andersson",
    "Noor Hassan",
    "Mateo García",
    "Yuki Tanaka",
    "Layla Reyes",
    "Omar Kadri",
  ];

  private static readonly DEFAULT_ART_MEDIUMS = [
    "Oil Painting",
    "Watercolor",
    "Acrylic",
    "Digital Art",
    "Photography",
    "Sculpture",
    "Ceramics",
    "Printmaking",
    "Mixed Media",
    "Charcoal",
    "Pastel",
    "Ink",
    "Collage",
    "Installation",
    "Video Art",
    "Performance Art",
  ];

  private static readonly DEFAULT_ART_THEMES = [
    "Abstract",
    "Landscape",
    "Portrait",
    "Still Life",
    "Urban Life",
    "Nature",
    "Social Commentary",
    "Cultural Identity",
    "Memory",
    "Dreams",
    "Mythology",
    "Technology",
    "Environment",
    "Human Condition",
    "Minimalism",
    "Surrealism",
    "Expressionism",
    "Contemporary Issues",
  ];

  private static readonly DEFAULT_DOMAINS = [
    "artgallery",
    "artist-portfolio",
    "creative-studio",
    "art-collective",
    "visual-arts",
    "contemporary-art",
    "fine-arts",
    "digital-gallery",
    "sculpture-works",
    "painting-studio",
    "mixed-media-art",
    "photo-gallery",
  ];

  private static readonly COMMON_PAGE_PATHS = [
    "/",
    "/about",
    "/portfolio",
    "/gallery",
    "/contact",
    "/bio",
    "/cv",
    "/exhibitions",
    "/collections",
    "/studio",
    "/process",
    "/inspiration",
    "/blog",
    "/news",
    "/events",
    "/commissions",
    "/prints",
    "/shop",
    "/press",
    "/awards",
    "/residencies",
    "/teaching",
    "/workshops",
    "/artist-statement",
  ];

  private config: MockDataConfig;

  constructor(config: Partial<MockDataConfig> = {}) {
    this.config = {
      websiteCount: 1,
      minPagesPerWebsite: 30,
      maxPagesPerWebsite: 70,
      simulateProgress: false,
      progressSpeed: 500,
      artistNames: MockDataGenerator.DEFAULT_ARTIST_NAMES,
      artMediums: MockDataGenerator.DEFAULT_ART_MEDIUMS,
      artThemes: MockDataGenerator.DEFAULT_ART_THEMES,
      domains: MockDataGenerator.DEFAULT_DOMAINS,
      ...config,
    };
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomChoices<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  private generateRandomDomain(): string {
    const domain = this.randomChoice(this.config.domains!);
    const tld = this.randomChoice([".com", ".org", ".net", ".art", ".studio"]);
    const subdomain = Math.random() > 0.7 ? "www." : "";
    return `${subdomain}${domain}${tld}`;
  }

  private generatePagePaths(count: number): string[] {
    const paths = new Set<string>();

    // Always include homepage
    paths.add("/");

    // Add common paths first
    const availablePaths = [...MockDataGenerator.COMMON_PAGE_PATHS.slice(1)];
    while (paths.size < Math.min(count, availablePaths.length + 1)) {
      const path = availablePaths.splice(
        Math.floor(Math.random() * availablePaths.length),
        1,
      )[0];
      if (path) paths.add(path);
    }

    // Generate additional nested paths to reach target count
    const categories = [
      "series",
      "projects",
      "work",
      "art",
      "paintings",
      "sculptures",
    ];
    const subcategories = [
      "abstract",
      "landscape",
      "portrait",
      "digital",
      "mixed-media",
    ];

    while (paths.size < count) {
      const category = this.randomChoice(categories);
      const depth = Math.random();

      if (depth < 0.7) {
        // Single level: /category/item
        const id = Math.floor(Math.random() * 50) + 1;
        paths.add(`/${category}/${id}`);
      } else {
        // Two levels: /category/subcategory/item
        const subcategory = this.randomChoice(subcategories);
        const id = Math.floor(Math.random() * 20) + 1;
        paths.add(`/${category}/${subcategory}/${id}`);
      }
    }

    return Array.from(paths);
  }

  private generateLocalLinks(
    currentPath: string,
    allPaths: string[],
    domain: string,
  ): string[] {
    const linkCount = Math.floor(Math.random() * 8) + 3; // 3-10 links per page
    const availablePaths = allPaths.filter((path) => path !== currentPath);

    // Bias towards linking to related pages
    const relatedPaths = availablePaths.filter((path) => {
      const currentSegments = currentPath.split("/");
      const pathSegments = path.split("/");
      return (
        currentSegments.length > 1 &&
        pathSegments.length > 1 &&
        currentSegments[1] === pathSegments[1]
      ); // Same top-level category
    });

    // Mix of related and random links
    const selectedPaths = new Set<string>();

    // Add some related links
    if (relatedPaths.length > 0) {
      const relatedCount = Math.min(
        Math.floor(linkCount * 0.4),
        relatedPaths.length,
      );
      this.randomChoices(relatedPaths, relatedCount).forEach((path) =>
        selectedPaths.add(path),
      );
    }

    // Fill remaining with random links
    while (
      selectedPaths.size < linkCount &&
      selectedPaths.size < availablePaths.length
    ) {
      const randomPath = this.randomChoice(availablePaths);
      selectedPaths.add(randomPath);
    }

    return Array.from(selectedPaths).map((path) => `https://${domain}${path}`);
  }

  generateStaticData(): MockApiData {
    const data: MockApiData = {};

    for (let i = 0; i < this.config.websiteCount; i++) {
      const domain = this.generateRandomDomain();
      const homepageUrl = `https://${domain}`;

      const pageCount =
        Math.floor(
          Math.random() *
            (this.config.maxPagesPerWebsite -
              this.config.minPagesPerWebsite +
              1),
        ) + this.config.minPagesPerWebsite;

      const pagePaths = this.generatePagePaths(pageCount);

      const jobStart = Date.now() - Math.floor(Math.random() * 3600000); // Within last hour
      const jobEnd = jobStart + Math.floor(Math.random() * 600000) + 30000; // 30sec - 10min later

      const websiteData: any = {
        scrape_job_started: Math.floor(jobStart / 1000),
        scrape_job_finished: Math.floor(jobEnd / 1000),
        artist_name: this.randomChoice(this.config.artistNames!),
        art_mediums: this.randomChoices(
          this.config.artMediums!,
          Math.floor(Math.random() * 3) + 1,
        ),
        art_themes: this.randomChoices(
          this.config.artThemes!,
          Math.floor(Math.random() * 4) + 2,
        ),
      };

      // Add page data
      pagePaths.forEach((path) => {
        const pageUrl = `https://${domain}${path}`;
        const pageJobStart = jobStart + Math.floor(Math.random() * 300000); // Within job time
        const pageJobEnd = Math.min(
          pageJobStart + Math.floor(Math.random() * 60000) + 5000,
          jobEnd,
        );

        websiteData[pageUrl] = {
          scrape_job_started: Math.floor(pageJobStart / 1000),
          scrape_job_finished: Math.floor(pageJobEnd / 1000),
          links: this.generateLocalLinks(path, pagePaths, domain),
        };
      });

      data[homepageUrl] = websiteData;
    }

    return data;
  }

  async generateProgressiveData(
    onUpdate: (data: UnifiedWebsiteData[], isComplete: boolean) => void,
  ): Promise<UnifiedWebsiteData[]> {
    const finalApiData = this.generateStaticData();
    const finalData = this.transformToUnifiedFormat(finalApiData);

    // Start with empty websites
    const progressData: UnifiedWebsiteData[] = Object.keys(finalApiData).map(
      (homepageUrl) => {
        const domain = new URL(homepageUrl).hostname;
        return {
          website_domain: domain,
          sitemap: {},
          last_updated: Math.floor(Date.now() / 1000),
          artist_name: "",
          art_mediums: [],
          art_themes: [],
          source: "mock" as const,
        };
      },
    );

    onUpdate([...progressData], false);

    // Simulate progressive discovery for each website
    for (let i = 0; i < finalData.length; i++) {
      const finalWebsite = finalData[i];
      const progressWebsite = progressData[i];
      const homepageUrl = Object.keys(finalApiData)[i];
      const websiteApiData = finalApiData[homepageUrl];

      // Get all page URLs for this website
      const pageUrls = Object.keys(websiteApiData).filter(
        (key) =>
          ![
            "scrape_job_started",
            "scrape_job_finished",
            "artist_name",
            "art_mediums",
            "art_themes",
          ].includes(key),
      );

      // Add pages progressively
      for (const pageUrl of pageUrls) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.progressSpeed),
        );

        // Add the page with empty links initially
        (progressWebsite as any).sitemap[pageUrl] = [];
        progressWebsite.last_updated = Math.floor(Date.now() / 1000);

        onUpdate([...progressData], false);

        // Complete the page with links after a short delay
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.progressSpeed / 2),
        );

        (progressWebsite as any).sitemap[pageUrl] =
          finalWebsite.sitemap[pageUrl] || [];
        onUpdate([...progressData], false);
      }

      // Complete website metadata
      progressWebsite.artist_name = finalWebsite.artist_name;
      progressWebsite.art_mediums = finalWebsite.art_mediums;
      progressWebsite.art_themes = finalWebsite.art_themes;
      progressWebsite.last_updated = finalWebsite.last_updated;

      onUpdate([...progressData], false);
    }

    onUpdate(progressData, true);
    return progressData;
  }

  // Transform API data to unified format
  transformToUnifiedFormat(apiData: MockApiData): UnifiedWebsiteData[] {
    return Object.entries(apiData).map(([homepageUrl, websiteData]) => {
      const domain = new URL(homepageUrl).hostname;
      const sitemap: Record<string, string[]> = {};

      // Extract page data
      Object.entries(websiteData as Record<string, any>).forEach(
        ([key, value]) => {
          if (typeof value === "object" && value !== null && "links" in value) {
            sitemap[key] = value.links;
          }
        },
      );

      return {
        website_domain: domain,
        sitemap,
        last_updated:
          websiteData.scrape_job_finished || websiteData.scrape_job_started,
        artist_name: websiteData.artist_name,
        art_mediums: websiteData.art_mediums,
        art_themes: websiteData.art_themes,
        source: "mock" as const,
      };
    });
  }

  // Session persistence methods
  static saveConfigToSession(config: MockDataConfig): void {
    try {
      sessionStorage.setItem("mockDataConfig", JSON.stringify(config));
    } catch (error) {
      console.warn(
        "Failed to save mock data config to session storage:",
        error,
      );
    }
  }

  static loadConfigFromSession(): Partial<MockDataConfig> | null {
    try {
      const saved = sessionStorage.getItem("mockDataConfig");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn(
        "Failed to load mock data config from session storage:",
        error,
      );
      return null;
    }
  }

  static saveDataToSession(data: UnifiedWebsiteData[]): void {
    try {
      sessionStorage.setItem("mockWebsiteData", JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save mock data to session storage:", error);
    }
  }

  static loadDataFromSession(): UnifiedWebsiteData[] | null {
    try {
      const saved = sessionStorage.getItem("mockWebsiteData");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn("Failed to load mock data from session storage:", error);
      return null;
    }
  }
}
