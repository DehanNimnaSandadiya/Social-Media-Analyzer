import json
import google.generativeai as genai
from config import Config

genai.configure(api_key=Config.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


def generate_report(business_data: dict) -> dict:
    """
    Call Gemini API and return a structured report dict.
    """
    platforms_str = ", ".join(business_data.get("platforms", []))

    prompt = f"""
You are an expert digital marketing analyst specializing in Sri Lankan small and medium businesses.
Analyze this business and generate a detailed social media performance report.

Business Details:
- Business Name: {business_data['business_name']}
- Business Type: {business_data['business_type']}
- Description: {business_data['description']}
- Location: {business_data.get('location', 'Sri Lanka')}
- Target Province: {business_data.get('target_province', 'Western Province')}
- Social Media Platforms: {platforms_str}
- Current Followers: {business_data.get('current_followers', 0)}

Generate a complete social media strategy report. You MUST respond ONLY with valid JSON (no markdown, no backticks, no extra text) in this exact structure:

{{
  "executive_summary": "3-4 sentence overview of the business social media situation and key recommendations",
  "target_audience": {{
    "primary_age_group": "e.g. 18-35",
    "gender_split": {{ "male": 40, "female": 60 }},
    "interests": ["interest1", "interest2", "interest3", "interest4", "interest5"],
    "peak_online_hours": ["7AM-9AM", "12PM-2PM", "7PM-10PM"],
    "geographic_focus": "e.g. Colombo, Gampaha, Western Province"
  }},
  "platform_analysis": [
    {{
      "platform": "Facebook",
      "score": 75,
      "current_performance": "Brief current state",
      "recommendation": "Specific actionable recommendation",
      "post_frequency": "5-6 times per week",
      "best_post_times": ["8AM", "12PM", "7PM"]
    }}
  ],
  "content_strategy": {{
    "content_mix": [
      {{ "type": "Product Showcase", "percentage": 30, "description": "High-quality photos of products" }},
      {{ "type": "Educational Content", "percentage": 25, "description": "Tips relevant to your industry" }},
      {{ "type": "Behind the Scenes", "percentage": 20, "description": "Show your process and team" }},
      {{ "type": "Customer Testimonials", "percentage": 15, "description": "Share customer stories" }},
      {{ "type": "Promotions & Offers", "percentage": 10, "description": "Special deals and discounts" }}
    ],
    "content_ideas": [
      "Content idea 1 specific to this business",
      "Content idea 2 specific to this business",
      "Content idea 3 specific to this business",
      "Content idea 4 specific to this business",
      "Content idea 5 specific to this business",
      "Content idea 6 specific to this business"
    ],
    "hashtag_strategy": {{
      "primary_hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
      "local_hashtags": ["#SriLanka", "#Colombo", "#LKA"],
      "industry_hashtags": ["#industry1", "#industry2"]
    }}
  }},
  "engagement_predictions": {{
    "estimated_monthly_reach": {{ "current": 500, "projected_3months": 1200, "projected_6months": 2800 }},
    "engagement_rate": {{ "current": 2.1, "industry_average": 3.5, "target": 4.2 }},
    "follower_growth": {{
      "month1": 50,
      "month2": 85,
      "month3": 130,
      "month4": 180,
      "month5": 240,
      "month6": 310
    }},
    "weekly_engagement_trend": {{
      "monday": 65,
      "tuesday": 70,
      "wednesday": 80,
      "thursday": 75,
      "friday": 90,
      "saturday": 85,
      "sunday": 60
    }}
  }},
  "monthly_goals": [
    {{ "month": "Month 1", "goal": "Foundation building goal", "kpi": "Measurable KPI", "action": "Specific action" }},
    {{ "month": "Month 2", "goal": "Growth goal", "kpi": "Measurable KPI", "action": "Specific action" }},
    {{ "month": "Month 3", "goal": "Engagement goal", "kpi": "Measurable KPI", "action": "Specific action" }}
  ],
  "swot_analysis": {{
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
    "threats": ["Threat 1", "Threat 2"]
  }},
  "action_plan": [
    {{ "priority": "High", "action": "Immediate action 1", "timeline": "Week 1-2", "expected_outcome": "Expected result" }},
    {{ "priority": "High", "action": "Immediate action 2", "timeline": "Week 1-4", "expected_outcome": "Expected result" }},
    {{ "priority": "Medium", "action": "Medium term action", "timeline": "Month 2", "expected_outcome": "Expected result" }},
    {{ "priority": "Low", "action": "Long term action", "timeline": "Month 3", "expected_outcome": "Expected result" }}
  ],
  "budget_recommendation": {{
    "total_monthly_budget_lkr": 15000,
    "breakdown": [
      {{ "category": "Paid Advertising", "amount_lkr": 8000, "percentage": 53 }},
      {{ "category": "Content Creation", "amount_lkr": 4000, "percentage": 27 }},
      {{ "category": "Tools & Software", "amount_lkr": 3000, "percentage": 20 }}
    ]
  }},
  "competitor_insights": {{
    "market_position": "Brief statement about market position in Sri Lanka",
    "differentiators": ["Differentiator 1", "Differentiator 2"],
    "gaps_to_exploit": ["Gap 1", "Gap 2"]
  }},
  "overall_score": 68,
  "report_generated_for": "{business_data['business_name']}"
}}

Make all numbers, percentages, recommendations and content ideas highly specific to a {business_data['business_type']} business in Sri Lanka. Use realistic Sri Lankan market data.
"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        return json.loads(raw)

    except json.JSONDecodeError:
        # Fallback: return structured mock data so the UI always works
        return _fallback_report(business_data)
    except Exception as e:
        print(f"Gemini error: {e}")
        return _fallback_report(business_data)


def _fallback_report(business_data: dict) -> dict:
    """Fallback structured report if Gemini fails."""
    name = business_data.get("business_name", "Your Business")
    btype = business_data.get("business_type", "Business")
    platforms = business_data.get("platforms", ["Facebook"])

    platform_analysis = []
    scores = {"Facebook": 72, "Instagram": 68, "TikTok": 55, "Twitter": 50, "YouTube": 60, "LinkedIn": 65}
    for p in platforms:
        platform_analysis.append({
            "platform": p,
            "score": scores.get(p, 60),
            "current_performance": f"Moderate activity on {p} with room for improvement.",
            "recommendation": f"Increase posting frequency and use {p}-native features like Reels or Stories.",
            "post_frequency": "5 times per week",
            "best_post_times": ["8AM", "12PM", "7PM"]
        })

    return {
        "executive_summary": f"{name} is a {btype} business with growing social media presence in Sri Lanka. With the right strategy focusing on consistent posting and audience engagement, significant growth is achievable within 3-6 months. Key priorities include establishing a content calendar, leveraging local hashtags, and engaging with the Sri Lankan online community.",
        "target_audience": {
            "primary_age_group": "22-40",
            "gender_split": {"male": 45, "female": 55},
            "interests": ["Local products", "Quality service", "Convenience", "Value for money", "Sri Lankan culture"],
            "peak_online_hours": ["7AM-9AM", "12PM-2PM", "7PM-10PM"],
            "geographic_focus": "Colombo, Gampaha, Kandy districts"
        },
        "platform_analysis": platform_analysis if platform_analysis else [{
            "platform": "Facebook",
            "score": 72,
            "current_performance": "Moderate activity with room for improvement.",
            "recommendation": "Post 5-6 times per week using local language and relatable content.",
            "post_frequency": "5-6 times per week",
            "best_post_times": ["8AM", "12PM", "7PM"]
        }],
        "content_strategy": {
            "content_mix": [
                {"type": "Product Showcase", "percentage": 30, "description": "High-quality photos/videos of products"},
                {"type": "Educational Content", "percentage": 25, "description": "Tips and guides relevant to your industry"},
                {"type": "Behind the Scenes", "percentage": 20, "description": "Show your team and process"},
                {"type": "Customer Testimonials", "percentage": 15, "description": "Share real customer success stories"},
                {"type": "Promotions", "percentage": 10, "description": "Special offers and seasonal deals"}
            ],
            "content_ideas": [
                f"Post a 'Day in the life' video showing how {name} operates",
                "Share before-and-after content showing customer transformations",
                "Create Sinhala/Tamil language posts to connect with local audience",
                "Post weekly tips related to your industry every Monday",
                "Share customer reviews as visually designed graphics",
                "Create festive content for Sri Lankan holidays (Avurudu, Vesak, etc.)"
            ],
            "hashtag_strategy": {
                "primary_hashtags": [f"#{name.replace(' ', '')}", f"#{btype.replace(' ', '')}SL", "#SriLankanBusiness"],
                "local_hashtags": ["#SriLanka", "#Colombo", "#LKA", "#SriLankanMade"],
                "industry_hashtags": [f"#{btype.replace(' ', '')}", "#SmallBusinessSL", "#SupportLocal"]
            }
        },
        "engagement_predictions": {
            "estimated_monthly_reach": {"current": 800, "projected_3months": 1800, "projected_6months": 4200},
            "engagement_rate": {"current": 2.3, "industry_average": 3.5, "target": 4.8},
            "follower_growth": {"month1": 45, "month2": 80, "month3": 120, "month4": 170, "month5": 230, "month6": 300},
            "weekly_engagement_trend": {"monday": 65, "tuesday": 72, "wednesday": 80, "thursday": 75, "friday": 88, "saturday": 85, "sunday": 60}
        },
        "monthly_goals": [
            {"month": "Month 1", "goal": "Establish consistent posting schedule", "kpi": "Post 20+ times, gain 50 followers", "action": "Create 30-day content calendar"},
            {"month": "Month 2", "goal": "Grow audience engagement", "kpi": "Achieve 3.5% engagement rate", "action": "Launch 2 interactive campaigns"},
            {"month": "Month 3", "goal": "Convert followers to customers", "kpi": "Generate 20+ leads from social media", "action": "Run targeted promotions"}
        ],
        "swot_analysis": {
            "strengths": ["Local market knowledge", "Personal customer relationships", "Authentic Sri Lankan brand"],
            "weaknesses": ["Limited digital marketing budget", "Inconsistent posting schedule"],
            "opportunities": ["Growing Sri Lankan internet users", "Rising e-commerce adoption", "Underserved local market"],
            "threats": ["International brand competition", "Changing social media algorithms", "Economic uncertainty"]
        },
        "action_plan": [
            {"priority": "High", "action": "Set up complete social media profiles with consistent branding", "timeline": "Week 1", "expected_outcome": "Professional online presence"},
            {"priority": "High", "action": "Create and schedule 30 days of content", "timeline": "Week 1-2", "expected_outcome": "Consistent posting rhythm"},
            {"priority": "Medium", "action": "Engage with local Sri Lankan business communities online", "timeline": "Month 2", "expected_outcome": "Network growth and referrals"},
            {"priority": "Low", "action": "Invest in paid advertising (Rs. 5,000-10,000/month)", "timeline": "Month 3", "expected_outcome": "Expanded reach beyond current followers"}
        ],
        "budget_recommendation": {
            "total_monthly_budget_lkr": 15000,
            "breakdown": [
                {"category": "Paid Advertising", "amount_lkr": 8000, "percentage": 53},
                {"category": "Content Creation", "amount_lkr": 4000, "percentage": 27},
                {"category": "Tools & Software", "amount_lkr": 3000, "percentage": 20}
            ]
        },
        "competitor_insights": {
            "market_position": f"As a {btype} in Sri Lanka, you operate in a competitive but growing digital market with significant opportunity for local brands.",
            "differentiators": ["Local authenticity and cultural understanding", "Personal customer service approach"],
            "gaps_to_exploit": ["Sinhala/Tamil language content gap", "Hyperlocal community engagement"]
        },
        "overall_score": 65,
        "report_generated_for": name
    }
