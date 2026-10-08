# Pondicherry University Marketplace

## Overview
A student-to-student resale marketplace built exclusively for Pondicherry University. This platform replaces the informal WhatsApp commerce ecosystem with a structured, searchable, and trusted environment.

## The Problem
Campus commerce is trapped inside WhatsApp:
- Listings disappear into conversations
- Prices are hard to find
- Repeated "Is this still available?" queries
- Sellers must constantly repost items
- No reliable transaction record

## The Solution
This marketplace provides:
1. Persistent, searchable listings
2. Clear availability states
3. Verified university identities
4. Structured offer and negotiation system
5. Secure records of past transactions

## Deployment
This application is designed specifically for deployment to **Google Cloud Run**.

1. Build the container: `docker build -t pondicherry-marketplace .`
2. Push to Google Container Registry or Artifact Registry.
3. Deploy to Cloud Run with environment variables set (`DATABASE_URL`, `JWT_SECRET`).
