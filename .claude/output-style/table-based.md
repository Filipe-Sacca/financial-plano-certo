---
description: Comprehensive table-based presentation with structured data organization and optimal readability
---

# Table-Based Output Style

Present information primarily through well-structured Markdown tables optimized for clarity, scannability, and professional data presentation. This style transforms complex information into organized, digestible formats that enable quick comprehension and efficient decision-making.

## Core Table Principles

### Structure Priority
- **Tables First**: Default to tabular presentation for any structured information
- **Scannable Layout**: Design for quick visual scanning and pattern recognition  
- **Consistent Formatting**: Maintain uniform alignment, spacing, and styling
- **Progressive Detail**: Layer information from summary to specifics

### Information Architecture
- **Logical Grouping**: Related information in adjacent columns
- **Hierarchical Organization**: Most important data in leftmost columns
- **Context Preservation**: Include reference information in each table
- **Action-Oriented**: Structure tables to support decision-making

## Table Types & Applications

### 1. Comparison Tables
**Use Case**: Feature analysis, tool selection, option evaluation

| Feature | Option A | Option B | Option C | Recommendation |
|---------|----------|----------|----------|----------------|
| **Performance** | High ⚡ | Medium | Low | Option A |
| **Cost** | $$$$ | $$ | $ | Option B for budget |
| **Complexity** | Complex | Simple | Medium | Option B for speed |
| **Scalability** | Excellent | Good | Limited | Option A for growth |

### 2. Status & Progress Tables
**Use Case**: Project tracking, issue monitoring, system health

| Component | Status | Progress | Issues | ETA |
|-----------|---------|----------|---------|-----|
| **Frontend** | 🔄 In Progress | 75% | 2 minor | 3 days |
| **Backend** | ✅ Complete | 100% | 0 | Done |
| **Database** | ⚠️ Blocked | 60% | 1 critical | TBD |
| **Testing** | 📋 Pending | 0% | 0 | 5 days |

### 3. Technical Specifications
**Use Case**: Configuration details, parameter definitions, system specs

| Parameter | Value | Type | Required | Description |
|-----------|--------|------|----------|-------------|
| `max_connections` | `1000` | Integer | Yes | Maximum concurrent connections |
| `timeout_ms` | `30000` | Integer | No | Request timeout in milliseconds |
| `ssl_enabled` | `true` | Boolean | Yes | Enable SSL/TLS encryption |
| `log_level` | `"info"` | String | No | Logging verbosity level |

### 4. Step-by-Step Procedures
**Use Case**: Implementation guides, troubleshooting steps, workflows

| Step | Action | Command/Code | Expected Result | Notes |
|------|--------|--------------|-----------------|-------|
| **1** | Initialize project | `npm init -y` | package.json created | Use default settings |
| **2** | Install dependencies | `npm install express` | Dependencies in node_modules | Check for vulnerabilities |
| **3** | Create server file | `touch server.js` | Empty server.js file | Main application entry |
| **4** | Configure routing | See code below | Server responds | Test with curl |

### 5. Analysis & Findings Tables
**Use Case**: Code review, audit results, performance analysis

| Issue | Severity | File/Location | Description | Recommendation |
|-------|----------|---------------|-------------|----------------|
| **SEC-001** | 🚨 Critical | `auth.js:45` | Plain text passwords | Hash with bcrypt |
| **PERF-002** | ⚠️ Medium | `db.js:120` | N+1 query pattern | Implement eager loading |
| **STYLE-003** | ℹ️ Low | `utils.js:67` | Inconsistent naming | Follow camelCase |

### 6. Resource & Dependencies Tables
**Use Case**: Package management, resource allocation, inventory

| Resource | Version | Size | License | Purpose | Status |
|----------|---------|------|---------|---------|--------|
| **React** | 18.2.0 | 42.2kB | MIT | UI Framework | ✅ Current |
| **Express** | 4.18.2 | 65.1kB | MIT | Backend Server | ⚠️ Update Available |
| **MongoDB** | 6.0.4 | - | SSPL | Database | ✅ Current |

## Advanced Table Formatting

### Column Alignment Guidelines

| Content Type | Alignment | Example |
|--------------|-----------|---------|
| **Text Labels** | Left | Names, descriptions, titles |
| **Numeric Values** | Right | Prices, counts, percentages |
| **Status Indicators** | Center | ✅ ⚠️ ❌ 🔄 |
| **Short Codes** | Center | IDs, abbreviations, flags |
| **Mixed Content** | Left | Default for complex cells |

### Cell Content Optimization

#### Visual Indicators
- **Status Icons**: ✅ Success, ⚠️ Warning, ❌ Error, 🔄 In Progress, 📋 Pending
- **Priority Levels**: 🚨 Critical, ⚠️ High, ℹ️ Medium, 💡 Low
- **Performance**: ⚡ Fast, 🐌 Slow, 📊 Measured, 🎯 Target

#### Text Formatting
- **Bold**: Primary identifiers, key terms, headers
- **Code**: `Technical values`, `file.names`, `commands`
- **Emphasis**: *Secondary information*, *contextual notes*
- **Links**: [Documentation](url), [Source](url)

### Nested Information Strategies

#### Multi-Level Headers
```markdown
| Component | Details | Status |
|-----------|---------|---------|
| **Frontend** | | |
| ├─ React App | v18.2.0 | ✅ Working |
| ├─ CSS Framework | Tailwind | ✅ Working |
| └─ Build Tools | Vite | ⚠️ Needs update |
| **Backend** | | |
| ├─ API Server | Express | ✅ Working |
| └─ Database | MongoDB | 🔄 Migrating |
```

#### Grouped Information
```markdown
| Category | Item | Value | Notes |
|----------|------|-------|-------|
| **Performance** | Load Time | 2.3s | Target: <3s |
| | Bundle Size | 245kB | Acceptable |
| | Core Vitals | 85/100 | Good |
| **Security** | Vulnerabilities | 0 | Scanned today |
| | SSL Grade | A+ | Let's Encrypt |
| | Headers | Secure | HSTS enabled |
```

## Response Structure Templates

### Executive Summary Format
```markdown
| Metric | Current | Target | Status | Action Required |
|--------|---------|---------|---------|-----------------|
| **Performance** | 2.1s | <2.0s | 🟡 Close | Minor optimization |
| **Security** | 98% | 100% | 🟢 Good | Review 2 items |
| **Quality** | 85% | 90% | 🟡 Close | Address 3 issues |
| **Coverage** | 78% | 85% | 🔴 Below | Add 15 tests |
```

### Detailed Analysis Format
```markdown
## Performance Analysis

| Component | Metric | Current | Benchmark | Gap | Recommendation |
|-----------|---------|---------|-----------|-----|----------------|
| **Frontend** | Load Time | 2.1s | 1.8s | +0.3s | Code splitting |
| **API** | Response Time | 145ms | 100ms | +45ms | Database optimization |
| **Database** | Query Time | 85ms | 50ms | +35ms | Add indexes |

## Implementation Plan

| Phase | Tasks | Duration | Dependencies | Success Criteria |
|-------|-------|----------|--------------|-------------------|
| **Phase 1** | Frontend optimization | 3 days | - | Load time <2.0s |
| **Phase 2** | API improvements | 2 days | Phase 1 | Response <120ms |
| **Phase 3** | Database tuning | 4 days | Phase 2 | Query <60ms |
```

## Specialized Table Patterns

### Code Review Tables
```markdown
| File | Line | Issue | Type | Severity | Fix |
|------|------|-------|------|----------|-----|
| `app.js` | 23 | Unused variable | Style | Low | Remove `temp` |
| `auth.js` | 67 | SQL injection risk | Security | Critical | Use parameterized queries |
| `utils.js` | 145 | Performance bottleneck | Performance | Medium | Cache results |
```

### Configuration Tables
```markdown
| Environment | Database URL | Cache | Log Level | SSL |
|-------------|--------------|-------|-----------|-----|
| **Development** | `localhost:5432` | Redis | Debug | No |
| **Staging** | `stage-db.company.com` | Redis | Info | Yes |
| **Production** | `prod-db.company.com` | Redis Cluster | Warn | Yes |
```

### Test Results Tables
```markdown
| Test Suite | Tests | Passed | Failed | Coverage | Duration |
|------------|-------|---------|---------|----------|----------|
| **Unit** | 145 | 142 | 3 | 85% | 12.3s |
| **Integration** | 67 | 65 | 2 | 78% | 45.2s |
| **E2E** | 23 | 23 | 0 | 65% | 180.5s |
| **Total** | 235 | 230 | 5 | 79% | 238.0s |
```

## Best Practices

### Readability Optimization
- **Consistent Width**: Balance column widths for readability
- **White Space**: Use spacing to separate logical groups
- **Visual Hierarchy**: Bold headers, clear sections, logical flow
- **Scannable Content**: Key information visible at a glance

### Information Density
- **Optimal Cell Size**: 2-4 words for labels, 1-2 lines for descriptions
- **Meaningful Headers**: Descriptive, action-oriented column names
- **Smart Abbreviations**: Use standard abbreviations when space is limited
- **Progressive Disclosure**: Summary tables with detail links/references

### Accessibility & Usability
- **Screen Reader Friendly**: Clear headers and logical structure
- **Mobile Responsive**: Consider how tables render on small screens
- **Print Friendly**: Tables that work well in printed documents
- **Copy-Paste Ready**: Format for easy extraction and reuse

### Quality Assurance
- **Data Validation**: Ensure all cells contain accurate, current information
- **Consistency Checks**: Uniform formatting across all tables
- **Completeness**: No empty cells without clear indication why
- **Update Tracking**: Include timestamps or version info when relevant

This table-based approach transforms complex information into accessible, professional presentations that support quick decision-making and effective communication.