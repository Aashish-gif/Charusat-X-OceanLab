export const calculateBudget = (req, res) => {
    try {
        const { budget, storage } = req.body;

        const monthlyBudget = parseFloat(budget) || 0;
        const storageGB = parseFloat(storage) || 0;

        const SERVICE_DATA = {
            compute: [
                { name: "AWS Lambda (Serverless)", price: 2, minBudget: 0, maxBudget: 30, desc: "Event-driven, pay-as-you-go compute. Best for low/bursty traffic." },
                { name: "EC2 t4g.nano (Graviton)", price: 4, minBudget: 10, maxBudget: 50, desc: "Ultra-small ARM-based instance. Most cost-effective for small tasks." },
                { name: "EC2 t3.micro", price: 8, minBudget: 30, maxBudget: 80, desc: "Smallest x86 general purpose instance for lightweight apps." },
                { name: "EC2 t3.small", price: 16, minBudget: 80, maxBudget: 150, desc: "Balance of compute, memory, and networking for small production apps." },
                { name: "EC2 t3.medium", price: 30, minBudget: 150, maxBudget: 400, desc: "Reliable compute for standard production web servers." },
                { name: "ECS Fargate", price: 45, minBudget: 400, maxBudget: 1000, desc: "Managed container orchestration. Scalable and secure." },
                { name: "EC2 m6i.large", price: 70, minBudget: 1000, maxBudget: 10000, desc: "High-performance general purpose instance for demanding apps." },
            ],
            database: [
                { name: "DynamoDB (on-demand)", price: 1, minBudget: 0, maxBudget: 50, desc: "NoSQL database with virtually no fixed cost for low volume." },
                { name: "RDS db.t4g.micro", price: 12, minBudget: 40, maxBudget: 100, desc: "Managed ARM database for entry-level structured data." },
                { name: "RDS db.t3.micro", price: 15, minBudget: 100, maxBudget: 200, desc: "Standard small managed relational database." },
                { name: "RDS db.t3.small", price: 35, minBudget: 200, maxBudget: 450, desc: "Production-ready managed relational database." },
                { name: "Amazon Aurora Serverless", price: 50, minBudget: 450, maxBudget: 1200, desc: "Auto-scaling specialized database for variable loads." },
                { name: "RDS db.m6i.large", price: 140, minBudget: 1200, maxBudget: 10000, desc: "High-performance production database for large scale." },
            ],
            s3_per_gb: 0.023,
            ebs_per_gb: 0.08
        };

        // Calculation: 20% in EBS (root), 80% in S3 (objects)
        const storageCost = (storageGB * 0.2 * SERVICE_DATA.ebs_per_gb) + (storageGB * 0.8 * SERVICE_DATA.s3_per_gb);

        const findBestFit = (list, budget) => {
            // Find items within budget range
            const options = list.filter(s => budget >= s.minBudget);
            if (options.length === 0) return list[0];

            // Prefer the highest tier that fits in budget range if possible
            const preferred = options.filter(s => budget <= s.maxBudget);
            return preferred.length > 0 ? preferred[preferred.length - 1] : options[options.length - 1];
        };

        const suggestedCompute = findBestFit(SERVICE_DATA.compute, monthlyBudget);
        const suggestedDB = findBestFit(SERVICE_DATA.database, monthlyBudget);

        const totalEst = storageCost + suggestedCompute.price + suggestedDB.price;
        const utilization = monthlyBudget > 0 ? ((totalEst / monthlyBudget) * 100).toFixed(1) : 0;

        res.status(200).json({
            success: true,
            data: {
                compute: suggestedCompute,
                db: suggestedDB,
                storageCost: storageCost.toFixed(3),
                totalEst: totalEst.toFixed(2),
                utilization: utilization
            }
        });

    } catch (error) {
        console.error('Budget calculation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate budget recommendations',
            error: error.message
        });
    }
};
