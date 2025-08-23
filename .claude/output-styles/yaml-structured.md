---
description: Generate clean, well-structured YAML with proper syntax, indentation, and best practices for configuration files and data structures
---

# YAML-Structured Output Style

Generate clean, well-structured YAML content following industry best practices for configuration files, data structures, and documentation.

## Core YAML Principles

### 1. Indentation and Structure
- **Use 2 spaces for indentation** - never tabs
- **Maintain consistent indentation** throughout the document
- **Align related items** at the same indentation level
- **Use proper nesting** for hierarchical data

### 2. Data Type Guidelines
- **Strings**: Use quotes when containing special characters, spaces, or when ambiguous
- **Numbers**: Write as bare values (no quotes for integers/floats)
- **Booleans**: Use `true/false` (lowercase)
- **Null values**: Use `null` or omit the key entirely
- **Arrays**: Use consistent formatting (block or flow style)

### 3. YAML Best Practices

#### Naming Conventions
- Use **snake_case** for keys (preferred) or **kebab-case** consistently
- Choose **descriptive, meaningful names** for all keys
- **Avoid abbreviations** unless widely understood
- **Use consistent naming patterns** throughout the document

#### Comments and Documentation
- Use `#` for comments with proper spacing
- Add **header comments** to explain document purpose
- Include **inline comments** for complex or non-obvious values
- **Document required vs optional fields** when applicable

#### Multi-line Strings
- Use `|` (literal) for preserving line breaks and formatting
- Use `>` (folded) for long text that should wrap
- Use `|-` or `>-` to strip final newlines when needed

#### Arrays and Objects
- Use **block style** for readability in configuration files
- Use **flow style** sparingly for short, simple lists
- **Maintain consistent formatting** within the same document

## Output Format Requirements

### Document Structure
1. **Start with document separator** (`---`) when needed
2. **Include descriptive comments** at the top level
3. **Group related configurations** logically
4. **Use consistent indentation and spacing** throughout
5. **End with proper document termination** if multiple documents

### Validation Standards
- **Ensure valid YAML syntax** - all output must parse correctly
- **Maintain semantic correctness** for the intended use case
- **Follow schema requirements** when applicable
- **Test compatibility** with common YAML parsers

### Quality Markers
- ✅ **Proper indentation** (2 spaces, no tabs)
- ✅ **Consistent formatting** throughout
- ✅ **Clear, descriptive keys** with meaningful names
- ✅ **Appropriate data types** for all values
- ✅ **Helpful comments** where needed
- ✅ **Valid syntax** that parses without errors

## Example Templates

### Configuration File Template
```yaml
# Application Configuration
# Version: 1.0
# Purpose: Main application settings and environment configuration

app:
  name: "my-application"
  version: "1.2.3"
  environment: production
  debug: false

database:
  host: "localhost"
  port: 5432
  name: "app_db"
  ssl_enabled: true
  connection_pool:
    min: 2
    max: 10
    timeout: 30

features:
  - authentication
  - logging
  - monitoring
  
logging:
  level: info
  format: json
  outputs:
    - console
    - file
```

### Data Structure Template
```yaml
# User Profile Data Structure
# Schema version: 2.1

user_profile:
  personal_info:
    first_name: "John"
    last_name: "Doe"
    email: "john.doe@example.com"
    birth_date: "1990-01-15"
    
  preferences:
    language: "en"
    timezone: "UTC-05:00"
    notifications:
      email: true
      push: false
      sms: false
      
  permissions:
    roles:
      - user
      - contributor
    scopes:
      - read:profile
      - write:own_data
      
  metadata:
    created_at: "2024-01-01T00:00:00Z"
    last_login: "2024-01-15T14:30:00Z"
    account_status: active
```

## Content Guidelines

### When Generating YAML
1. **Always validate syntax** before presenting output
2. **Include relevant comments** for configuration context
3. **Use appropriate data types** for each value
4. **Maintain consistent formatting** throughout
5. **Follow semantic conventions** for the domain (e.g., Kubernetes, Docker Compose, CI/CD)

### Error Prevention
- **Never mix tabs and spaces** for indentation
- **Always use proper quoting** for strings with special characters
- **Validate array and object nesting** carefully
- **Check for trailing commas** or syntax errors
- **Ensure proper document structure** with separators when needed

### Domain-Specific Considerations
- **Kubernetes**: Follow k8s resource conventions and required fields
- **Docker Compose**: Use proper service definitions and networking
- **CI/CD**: Include proper stage definitions and dependencies  
- **OpenAPI**: Follow specification structure and data types
- **GitHub Actions**: Use correct workflow syntax and action references

This style ensures all YAML output is clean, readable, syntactically correct, and follows established best practices for maintainability and compatibility.