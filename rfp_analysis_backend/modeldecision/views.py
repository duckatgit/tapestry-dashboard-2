import os
import json
import requests
from openai import OpenAI
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET

SERPER_API_KEY = '916351dcaf8f0b5f5faaddb9fcbff96036061984'
OPENAI_API_KEY = ''
HUNTER_API_KEY = 'd4d896b0c02ed3f5b9f925bc91eb0acab30249b8'

client = OpenAI(api_key=OPENAI_API_KEY)

def get_company_name(company_number):
    api_key = '8ccb3d26-7717-4491-957b-8522c221396a'
    url = f"https://api.company-information.service.gov.uk/company/{company_number}"
    response = requests.get(url, auth=(api_key, ''))
    if response.status_code == 200:
        return response.json().get('company_name')
    return None

def fetch_company_data(company_name):
    url = "https://google.serper.dev/search"
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    query = {"q": company_name, "gl": "uk"}
    response = requests.post(url, json=query, headers=headers)
    return response.json() if response.status_code == 200 else None

def generate_summary_and_email(company_name, raw_data):
    industry = raw_data.get('knowledgeGraph', {}).get('type', 'company')
    prompt = f"""You are an AI assistant. Here is some company data in JSON format: {json.dumps(raw_data)}.

The company is called {company_name}. They are in the {industry} industry.

Task 1: Summarize the key information about {company_name} into a comprehensive paragraph.

Task 2: Generate a personalized marketing email to {company_name} introducing Hypha, a Private Equity firm who back founder owned businesses to grow ito significant players in their market. Write it from the perspective of the CEO of Hypha, Chris Wardle.
"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=600,
        temperature=0.7
    )

    output = response.choices[0].message.content.strip()

    if "Task 2:" in output:
        summary, email = output.split("Task 2:", 1)
        return summary.strip(), email.strip()
    else:
        return output, "Error: Could not generate email."

def infer_domain_with_openai(company_name):
    prompt = f"""Based on the company name "{company_name}", provide the most likely domain name only, without any additional text. Only provide the domain name."""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=50,
        temperature=0.5
    )
    domain = response.choices[0].message.content.strip()
    domain = domain.replace("http://", "").replace("https://", "").split('/')[0]
    return domain

def find_emails_hunter(domain):
    url = f"https://api.hunter.io/v2/domain-search?domain={domain}&api_key={HUNTER_API_KEY}&limit=10"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get('data', {}).get('emails', [])
    return []

def find_linkedin_url(company_name):
    url = "https://google.serper.dev/search"
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    payload = {"q": f"{company_name} LinkedIn", "gl": "uk"}
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        search_results = response.json()
        for result in search_results.get('organic', []):
            link = result.get('link', '')
            if 'linkedin.com/company' in link.lower() or 'linkedin.com/in' in link.lower():
                return link
    return None

@csrf_exempt
@require_GET
def get_company_info(request, company_number):
    try:
        name = get_company_name(company_number)
        if not name:
            return JsonResponse({"detail": "Company not found"}, status=404)

        data = fetch_company_data(name)
        if not data:
            return JsonResponse({"detail": "Company data not found"}, status=404)

        summary, email = generate_summary_and_email(name, data)
        domain = infer_domain_with_openai(name)
        contacts = find_emails_hunter(domain)
        linkedin = find_linkedin_url(name)

        return JsonResponse({
            "name": name,
            "summary": summary,
            "email": email,
            "domain": domain,
            "contacts": [{
                "email": c.get("value", ""),
                "firstName": c.get("first_name", "N/A"),
                "lastName": c.get("last_name", "N/A"),
                "position": c.get("position", "N/A")
            } for c in contacts],
            "linkedIn": linkedin
        })

    except Exception as e:
        return JsonResponse({"detail": str(e)}, status=500)
