export const getServiceRecommendation = (req, res) => {
    try {
        const { workloadType, budget } = req.body;
        const numericBudget = parseFloat(budget) || 0;

        let recommendation = {
            service: "EC2 Auto Scaling Group",
            reason: "Standard reliable compute for general purpose workloads. Scalable and dependable.",
            estimatedCost: `$${Math.max(30, numericBudget)}`,
            complexity: "Medium",
            tips: "Use Spot Instances for non-critical workloads to save up to 70% cost."
        };

        if (workloadType === 'Web Application') {
            if (numericBudget < 30) {
                recommendation = {
                    service: "Amazon Lightsail",
                    reason: "Provides a simplified experience with a fixed monthly price. Perfect for simple apps and blogs.",
                    estimatedCost: "$3.50 - $20 / month",
                    complexity: "Low",
                    tips: "Great for testing or small internal tools where simplicity beats scale."
                };
            } else if (numericBudget < 120) {
                recommendation = {
                    service: "AWS App Runner",
                    reason: "Build and run containerized web apps at scale without managing infrastructure. Secure by default.",
                    estimatedCost: "~$40+ / month",
                    complexity: "Low",
                    tips: "Connect directly to your GitHub repo for instant CI/CD deployment."
                };
            } else {
                recommendation = {
                    service: "Amazon ECS (Fargate) + ALB",
                    reason: "Highly scalable, enterprise-grade container service. Handles high traffic with ease.",
                    estimatedCost: "$100+ / month",
                    complexity: "Medium",
                    tips: "Use Graviton processors (t4g/m6g) for better price-performance."
                };
            }
        } else if (workloadType === 'Mobile Backend') {
            if (numericBudget < 60) {
                recommendation = {
                    service: "AWS Amplify",
                    reason: "Accelerates app development with a unified toolset. Automatically handles auth, storage, and API.",
                    estimatedCost: "Usage-based, very low for start",
                    complexity: "Low",
                    tips: "Integration with Cognito makes user auth incredibly easy to implement."
                };
            } else {
                recommendation = {
                    service: "Serverless (API Gateway + Lambda + DynamoDB)",
                    reason: "Modern cloud-native stack. Infinite scaling with zero management cost when idle.",
                    estimatedCost: "Pay-as-you-go",
                    complexity: "Medium",
                    tips: "Implement provisioned concurrency if you have latency-sensitive workloads (cold starts)."
                };
            }
        } else if (workloadType === 'Data Analytics') {
            if (numericBudget < 150) {
                recommendation = {
                    service: "Amazon Athena",
                    reason: "Serverless interactive query service that makes it easy to analyze data in S3 using standard SQL.",
                    estimatedCost: "$5 per TB scanned",
                    complexity: "Low",
                    tips: "Partition your data in S3 to significantly reduce scan costs and improve speed."
                };
            } else {
                recommendation = {
                    service: "Amazon Redshift Serverless",
                    reason: "High-performance data warehouse. Scale automatically based on workload demand.",
                    estimatedCost: "$250+ / month",
                    complexity: "High",
                    tips: "Use Redshift Spectrum to query data directly from S3 without loading it first."
                };
            }
        } else if (workloadType === 'File Storage') {
            recommendation = {
                service: "Amazon S3 (Intelligent-Tiering)",
                reason: "Auto-moves objects between tiers based on access frequency to save costs without performance impact.",
                estimatedCost: "$0.023 / GB + $0.0025 per 1k objects",
                complexity: "Low",
                tips: "Enable S3 Versioning and MFA Delete for critical backup/security compliance."
            };
        } else if (workloadType === 'Machine Learning') {
            if (numericBudget < 100) {
                recommendation = {
                    service: "SageMaker Canvas (No-Code ML)",
                    reason: "Generate highly accurate ML predictions without writing a single line of code.",
                    estimatedCost: "Usage-based (Starts low)",
                    complexity: "Low",
                    tips: "Start here to see if your data is 'predictable' before investing in custom models."
                };
            } else {
                recommendation = {
                    service: "Amazon SageMaker Studio",
                    reason: "End-to-end IDE for Machine Learning. Collaborate, train, and deploy in one place.",
                    estimatedCost: "$100+ / month",
                    complexity: "High",
                    tips: "Use Sagemaker JumpStart to deploy pre-trained models (LLMs/Vision) in minutes."
                };
            }
        }

        res.status(200).json({
            success: true,
            data: recommendation
        });

    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate recommendation',
            error: error.message
        });
    }
};
