# Backend Dockerfile for NetOps Visual
FROM golang:1.22-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates

WORKDIR /build

# Copy go mod files
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code
COPY *.go ./

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags="-s -w" -o netops-backend .

# Final stage
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates curl

WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/netops-backend .

# Copy GeoIP database (if exists)
# Note: You'll need to download GeoLite2-City.mmdb separately
COPY GeoLite2-City.mmdb* ./

# Expose port (note: with host network mode, this is documentary only)
EXPOSE 8081

# Run as root (required for network monitoring)
# In production, consider using capabilities instead
CMD ["./netops-backend"]
