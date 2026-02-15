Write-Host "Checking infrastructure health..." -ForegroundColor Cyan

# Check PostgreSQL
try {
    docker exec hris-postgres pg_isready -U hris
    Write-Host "✓ PostgreSQL is healthy" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL is not responding" -ForegroundColor Red
}

# Check Redis
try {
    docker exec hris-redis redis-cli ping
    Write-Host "✓ Redis is healthy" -ForegroundColor Green
} catch {
    Write-Host "✗ Redis is not responding" -ForegroundColor Red
}

# Check RabbitMQ
try {
    $response = Invoke-WebRequest -Uri "http://localhost:15672" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ RabbitMQ is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ RabbitMQ is not responding" -ForegroundColor Red
}