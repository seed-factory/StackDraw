# LLM Generation Guide for FossFLOW/StackDraw Compact Format

## Overview
This guide explains how to generate JSON files in the compact format that can be successfully imported into FossFLOW/StackDraw. The compact format is designed for LLM generation with minimal token usage while preserving all essential diagram information.

## Format Structure

The compact format uses this JSON structure:

```json
{
  "t": "Diagram Title (max 40 chars)",
  "i": [
    ["Item Name (max 30 chars)", "icon_id", "Description (max 100 chars)"],
    ["Another Item", "storage", "Database server for user data"]
  ],
  "v": [
    [
      [[0, 2, 4], [1, -2, 6]],
      [[0, 1], [1, 0]]
    ]
  ],
  "_": { "f": "compact", "v": "1.0" }
}
```

## Structure Explanation

### Root Level
- `t`: **Title** - Short diagram title (max 40 characters)
- `i`: **Items** - Array of diagram elements
- `v`: **Views** - Array of views (usually just one)
- `_`: **Metadata** - Format identifier (always `{"f": "compact", "v": "1.0"}`)

### Items Array (`i`)
Each item is an array with 3 elements:
1. **Name** (string, max 30 chars): Display name of the item
2. **Icon** (string): Icon identifier from available icons
3. **Description** (string, max 100 chars): Brief description

### Views Array (`v`)
Each view contains:
1. **Positions Array**: `[[itemIndex, x, y], ...]` - Position of each item
2. **Connections Array**: `[[fromIndex, toIndex], ...]` - Connections between items

## Available Icons

### Core Icons (ISOFLOW Collection) - 37 Icons
These icons are always available and render as isometric 3D shapes:

| Icon ID | Description | Use Case |
|---------|-------------|----------|
| `block` | Generic block | Default fallback, generic component |
| `cache` | Cache storage | Caching systems (Redis, Memcached) |
| `cardterminal` | Card terminal | Payment processing |
| `cloud` | Cloud shape | Cloud services, CDN, external APIs |
| `cronjob` | Scheduled task | Cron jobs, schedulers |
| `cube` | 3D cube | Containers, Docker, generic component |
| `desktop` | Desktop computer | Web clients, admin panels |
| `diamond` | Diamond shape | Decision points, routing |
| `dns` | DNS server | DNS services, name resolution |
| `document` | Document | Files, documents, logs |
| `firewall` | Firewall | Security, firewalls, WAF |
| `function-module` | Function block | Lambda, serverless functions |
| `image` | Image file | Media storage, image processing |
| `laptop` | Laptop | Client devices, developers |
| `loadbalancer` | Load balancer | Load balancers, traffic distribution |
| `lock` | Padlock | Security, authentication, encryption |
| `mail` | Envelope | Email services, notifications |
| `mailmultiple` | Multiple envelopes | Bulk email, mailing lists |
| `mobiledevice` | Mobile phone | Mobile apps, mobile clients |
| `office` | Office building | Organizations, external services |
| `package-module` | Package | NPM packages, libraries, modules |
| `paymentcard` | Credit card | Payment systems |
| `plane` | Airplane | Deployment, CI/CD |
| `printer` | Printer | Print services, output |
| `pyramid` | Pyramid | Hierarchical structures |
| `queue` | Message queue | Message queues (RabbitMQ, SQS, Kafka) |
| `router` | Router | Routers, API gateways, networking |
| `server` | Server rack | Backend servers, APIs |
| `speech` | Speech bubble | Chat, messaging, notifications |
| `sphere` | Sphere | Global services, CDN endpoints |
| `storage` | Storage disk | Databases, file storage |
| `switch-module` | Network switch | Network switches, routing |
| `tower` | Communication tower | Broadcasting, streaming |
| `truck` | Delivery truck | Data transfer, migration |
| `truck-2` | Truck variant | Logistics, batch processing |
| `user` | Person | Users, customers, admins |
| `vm` | Virtual machine | VMs, compute instances |

### Cloud Provider Icons (Auto-loaded)

When using cloud-specific icons, the corresponding icon pack is automatically loaded:

#### AWS Icons (320+ available)
Use `aws-` prefix:
- `aws-ec2`, `aws-s3`, `aws-rds`, `aws-lambda`, `aws-api-gateway`
- `aws-cloudfront`, `aws-route-53`, `aws-vpc`, `aws-elb`, `aws-iam`
- `aws-cloudwatch`, `aws-sns`, `aws-sqs`, `aws-dynamodb`, `aws-eks`

#### Azure Icons (369+ available)
Use `azure-` prefix:
- `azure-virtual-machine`, `azure-storage-account`, `azure-sql-database`
- `azure-app-service`, `azure-function-app`, `azure-api-management`
- `azure-cosmos-db`, `azure-kubernetes-service`, `azure-active-directory`

#### GCP Icons (280+ available)
Use `gcp-` prefix:
- `gcp-compute-engine`, `gcp-cloud-storage`, `gcp-cloud-sql`
- `gcp-app-engine`, `gcp-cloud-functions`, `gcp-kubernetes-engine`
- `gcp-cloud-pub-sub`, `gcp-bigquery`, `gcp-cloud-run`

#### Kubernetes Icons (56 available)
Use `k8s-` prefix:
- `k8s-pod`, `k8s-service`, `k8s-deployment`, `k8s-ingress`
- `k8s-configmap`, `k8s-secret`, `k8s-namespace`, `k8s-node`

## Legacy IsoFlow Compatibility

The following legacy icon names are automatically mapped to core icons:

| Legacy Name | Maps To | Description |
|-------------|---------|-------------|
| `web` | `desktop` | Web applications |
| `mobile` | `mobiledevice` | Mobile devices |
| `cdn` | `cloud` | Content delivery |
| `load-balancer` | `loadbalancer` | Load balancers |
| `security` | `lock` | Security components |
| `function` | `function-module` | Serverless functions |
| `analytics` | `block` | Analytics (generic) |
| `database` | `storage` | Databases |
| `api` | `server` | API servers |
| `gateway` | `router` | API gateways |
| `email` | `mail` | Email services |
| `notification` | `mail` | Notifications |
| `file`, `files` | `document` | Documents |
| `compute` | `server` | Compute instances |
| `container` | `cube` | Containers |
| `kubernetes`, `docker` | `cube` | Container orchestration |
| `lambda`, `serverless` | `function-module` | Functions |
| `messaging`, `pubsub` | `queue` | Message queues |
| `monitor` | `desktop` | Monitoring |
| `logging` | `document` | Logging |
| `metrics` | `block` | Metrics |

**Note**: Unknown icons automatically fall back to `block`.

## Positioning System

The positioning system uses an isometric grid coordinate system:
- **X-axis**: Horizontal position (negative = left, positive = right)
- **Y-axis**: Depth position (negative = up/back, positive = down/front)
- **Grid spacing**: Each unit represents one grid cell
- **Typical range**: -20 to +20 for both axes

### Positioning Guidelines:
- Start with main components around (0, 0)
- Place related components close together
- Use consistent spacing (3-5 units between components)
- Arrange in logical flow (left to right, top to bottom)
- Consider isometric perspective: items at higher Y appear "in front"

## Connection Guidelines

Connections are defined as `[fromIndex, toIndex]` pairs:
- **fromIndex**: Index of source item in items array (0-based)
- **toIndex**: Index of destination item in items array (0-based)
- **Direction**: Connections show arrows (from → to)

### Common Connection Patterns:
- **Linear flow**: `[0,1], [1,2], [2,3]`
- **Hub and spoke**: `[0,1], [0,2], [0,3]`
- **Mesh**: Multiple connections between components
- **Layered**: Connections between architectural tiers

## Generation Examples

### Example 1: Simple Web Application

```json
{
  "t": "Simple Web App Architecture",
  "i": [
    ["Web Client", "desktop", "Browser-based frontend"],
    ["API Gateway", "router", "Request routing and auth"],
    ["Backend API", "server", "REST API server"],
    ["Database", "storage", "PostgreSQL database"],
    ["Cache", "cache", "Redis caching layer"]
  ],
  "v": [
    [
      [[0, -8, 0], [1, -2, 0], [2, 4, 0], [3, 10, 2], [4, 10, -2]],
      [[0, 1], [1, 2], [2, 3], [2, 4]]
    ]
  ],
  "_": { "f": "compact", "v": "1.0" }
}
```

### Example 2: Microservices Architecture

```json
{
  "t": "Microservices Architecture",
  "i": [
    ["Mobile App", "mobiledevice", "iOS/Android client"],
    ["Web App", "desktop", "React SPA"],
    ["API Gateway", "router", "Kong API Gateway"],
    ["User Service", "server", "User management"],
    ["Order Service", "server", "Order processing"],
    ["Message Queue", "queue", "RabbitMQ"],
    ["User DB", "storage", "PostgreSQL"],
    ["Order DB", "storage", "MongoDB"]
  ],
  "v": [
    [
      [
        [0, -10, -3], [1, -10, 3], [2, -4, 0],
        [3, 2, -3], [4, 2, 3], [5, 8, 0],
        [6, 8, -6], [7, 8, 6]
      ],
      [
        [0, 2], [1, 2], [2, 3], [2, 4],
        [3, 5], [4, 5], [3, 6], [4, 7]
      ]
    ]
  ],
  "_": { "f": "compact", "v": "1.0" }
}
```

### Example 3: AWS Serverless Architecture

```json
{
  "t": "AWS Serverless Architecture",
  "i": [
    ["CloudFront", "aws-cloudfront", "CDN distribution"],
    ["API Gateway", "aws-api-gateway", "REST API endpoint"],
    ["Lambda Auth", "aws-lambda", "JWT authentication"],
    ["Lambda API", "aws-lambda", "Business logic"],
    ["DynamoDB", "aws-dynamodb", "NoSQL database"],
    ["S3 Bucket", "aws-s3", "Static assets"],
    ["Cognito", "aws-cognito", "User pool"]
  ],
  "v": [
    [
      [
        [0, -8, 0], [1, -2, 0], [2, 2, -4], [3, 2, 4],
        [4, 8, 4], [5, -8, 6], [6, 2, -8]
      ],
      [
        [0, 1], [0, 5], [1, 2], [1, 3],
        [2, 6], [3, 4]
      ]
    ]
  ],
  "_": { "f": "compact", "v": "1.0" }
}
```

### Example 4: Kubernetes Cluster

```json
{
  "t": "Kubernetes Application",
  "i": [
    ["Ingress", "k8s-ingress", "NGINX ingress controller"],
    ["Frontend", "k8s-deployment", "React app pods"],
    ["Backend", "k8s-deployment", "Node.js API pods"],
    ["Service Mesh", "k8s-service", "Istio sidecar"],
    ["Database", "k8s-statefulset", "PostgreSQL cluster"],
    ["ConfigMap", "k8s-configmap", "Environment config"],
    ["Secrets", "k8s-secret", "Credentials"]
  ],
  "v": [
    [
      [
        [0, 0, -6], [1, -4, 0], [2, 4, 0],
        [3, 0, 2], [4, 4, 6], [5, -4, 6], [6, 0, 8]
      ],
      [
        [0, 1], [0, 2], [1, 3], [2, 3],
        [2, 4], [5, 1], [5, 2], [6, 4]
      ]
    ]
  ],
  "_": { "f": "compact", "v": "1.0" }
}
```

## Best Practices for LLM Generation

### 1. Icon Selection
- **Prefer core icons** for generic diagrams (faster loading)
- Use cloud provider icons only when specificity matters
- Unknown icons automatically fall back to `block`
- Match icon semantics to component function

### 2. Naming
- Keep names concise but descriptive (max 30 chars)
- Use standard terminology for components
- Include version/type info when relevant
- Avoid special characters

### 3. Descriptions
- Provide context about component purpose
- Include key technologies/versions when relevant
- Keep under 100 characters

### 4. Layout
- Group related components together
- Use consistent spacing (4-6 units between components)
- Consider data flow direction (left → right, top → bottom)
- Leave space for connection lines

### 5. Connections
- Model actual data/control flow
- Avoid crossing connections when possible
- Fewer connections = cleaner diagram
- Consider bidirectional vs unidirectional flows

## Validation Checklist

Before generating, ensure:
- [ ] All icon names exist in available icons list (or use fallback-safe names)
- [ ] Item names are ≤ 30 characters
- [ ] Descriptions are ≤ 100 characters
- [ ] Title is ≤ 40 characters
- [ ] Position coordinates are reasonable (-20 to +20)
- [ ] Connection indices reference valid items (0-based)
- [ ] Metadata format is exactly `{"f": "compact", "v": "1.0"}`
- [ ] JSON structure matches the required format
- [ ] All items have positions in the view

## Common Pitfalls to Avoid

1. **Invalid icon names**: Use exact icon IDs or legacy names from compatibility table
2. **Missing descriptions**: Always provide the third element in item arrays
3. **Incorrect metadata**: Use exact format `{"f": "compact", "v": "1.0"}`
4. **Invalid connections**: Ensure indices refer to existing items (0-based)
5. **Extreme coordinates**: Keep positions within -20 to +20 bounds
6. **Missing positions**: Every item must have a position in the view
7. **Overlapping items**: Space items at least 3-4 units apart

## Token Optimization Tips

- Use shorter but meaningful names
- Truncate descriptions to essential info
- Use efficient coordinate values
- Minimize redundant connections
- Group related components to reduce positioning complexity
- Use core icons instead of cloud-specific when appropriate

This format typically uses 70-90% fewer tokens than the full JSON format while maintaining complete functionality and visual fidelity when imported into FossFLOW/StackDraw.
