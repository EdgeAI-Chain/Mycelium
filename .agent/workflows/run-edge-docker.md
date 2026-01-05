---
description: build and run external edge services
---
# Run Edge Docker Services

1. Build and Start Containers
```bash
cd edge
docker-compose up --build -d
```

2. View Logs
```bash
cd edge
docker-compose logs -f
```

3. Stop Services
```bash
cd edge
docker-compose down
```
