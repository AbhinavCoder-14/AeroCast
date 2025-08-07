# Dockerfile for the Python worker application
#
# This is the "recipe" that tells Docker how to build a self-contained
# "box" (a container) for our background processing script.

# Start with a lightweight, official Python image.
FROM python:3.9-slim

# Set the main workspace inside the container to /app.
WORKDIR /app

# Copy the list of Python ingredients (requirements.txt) first.
# This helps Docker cache our dependencies and speed up future builds.
COPY requirements.txt ./

# Install all the Python ingredients (dependencies) from the list.
RUN pip install --no-cache-dir -r requirements.txt

# Now, copy the rest of our Python code into the workspace.
COPY . .

# The simple, final instruction to run when the container starts.
# This will execute our main worker script.
CMD ["python", "worker.py"]

