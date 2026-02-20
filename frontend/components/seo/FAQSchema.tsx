"use client";

import React from 'react';

interface FAQ {
    question: string;
    acceptedAnswer: string;
}

interface FAQSchemaProps {
    faqs: FAQ[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
    if (!faqs || faqs.length === 0) return null;

    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.acceptedAnswer
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
