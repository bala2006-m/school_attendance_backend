import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NewsService {
  private readonly API_KEY = '87cc14b38c0f6a38193db8ce661954a4';

  async fetchNews(
    category: 'education' | 'sports',
    language: 'en' | 'ta' = 'en',
  ) {
    try {
      // ✅ Define keywords for each category
      const keywords =
        category === 'education'
          ? '(education OR school OR students OR kids OR children)'
          : '(sports OR games OR athletics OR students OR kids OR children)';

      // ✅ Tamil Nadu priority news
      const tnUrl = `https://gnews.io/api/v4/search?q="Tamil Nadu" ${keywords ? 'AND ' + keywords : ''}&lang=${language}&max=10&sortby=publishedAt&token=${this.API_KEY}`;

      // ✅ India-wide fallback news
      const indiaUrl = `https://gnews.io/api/v4/search?q="India" ${keywords ? 'AND ' + keywords : ''}&lang=${language}&max=10&sortby=publishedAt&token=${this.API_KEY}`;

      // Fetch both in parallel
      const [tnResponse, indiaResponse] = await Promise.all([
        axios.get(tnUrl),
        axios.get(indiaUrl),
      ]);

      // ✅ Format news articles
      const formatArticles = (articles) =>
        articles.map((news) => ({
          title: news.title,
          description: news.description,
          image: news.urlToImage,
          source: news.source.name,
          publishedAt: news.publishedAt,
          url: news.url,
          language,
        }));

      const tnNews = formatArticles(tnResponse.data.articles);
      const indiaNews = formatArticles(indiaResponse.data.articles);

      // ✅ Merge (Tamil Nadu first, then India)
      const combined = [...tnNews, ...indiaNews];

      // ✅ Sort to prioritize student-related keywords (boost ranking)
      const boosted = combined.sort((a, b) => {
        const boostKeywords = ['students', 'kids', 'school', 'children'];
        const score = (title: string) =>
          boostKeywords.filter((kw) => title?.toLowerCase().includes(kw))
            .length;
        return score(b.title) - score(a.title); // Higher keyword match first
      });

      return boosted;
    } catch (error) {
      throw new Error('Failed to fetch news: ' + error.message);
    }
  }
}
