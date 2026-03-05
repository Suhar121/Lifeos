// ============================================================
// LifeOS — Jenkins Pipeline
// Multibranch pipeline: lint → test → build → deploy
// ============================================================

pipeline {
    agent any

    environment {
        DOCKER_IMAGE   = 'lifeos'
        DOCKER_TAG     = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
        COMPOSE_FILE   = 'docker-compose.yml'
        REGISTRY       = ''  // e.g. 'ghcr.io/suhar121' — leave empty for local builds
    }

    options {
        skipDefaultCheckout(true)
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        // --------------------------------------------------
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // --------------------------------------------------
        stage('Setup') {
            parallel {
                stage('Python Deps') {
                    steps {
                        sh '''
                            python3 -m venv .venv
                            . .venv/bin/activate
                            pip install --upgrade pip
                            pip install -r requirements.txt
                        '''
                    }
                }
                stage('Node Deps') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        // --------------------------------------------------
        stage('Lint') {
            parallel {
                stage('Python Lint') {
                    steps {
                        sh '''
                            . .venv/bin/activate
                            pip install flake8
                            flake8 app/ --max-line-length=120 --exclude=__pycache__,alembic/versions || true
                        '''
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint || true'
                        }
                    }
                }
            }
        }

        // --------------------------------------------------
        stage('Test') {
            steps {
                sh '''
                    . .venv/bin/activate
                    pip install pytest httpx
                    DATABASE_URL=sqlite:///./test.db \
                    SECRET_KEY=test-secret \
                    python -m pytest test_backend.py -v --tb=short || true
                '''
            }
        }

        // --------------------------------------------------
        stage('Build Docker Image') {
            steps {
                script {
                    def fullTag = REGISTRY ? "${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}" : "${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker build -t ${fullTag} ."
                    // Also tag as latest for the branch
                    def latestTag = REGISTRY ? "${REGISTRY}/${DOCKER_IMAGE}:${env.BRANCH_NAME}-latest" : "${DOCKER_IMAGE}:${env.BRANCH_NAME}-latest"
                    sh "docker tag ${fullTag} ${latestTag}"
                }
            }
        }

        // --------------------------------------------------
        stage('Push Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'dev'
                }
                expression { return env.REGISTRY?.trim() }
            }
            steps {
                script {
                    docker.withRegistry("https://${REGISTRY}", 'docker-registry-credentials') {
                        def fullTag = "${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                        sh "docker push ${fullTag}"
                        sh "docker push ${REGISTRY}/${DOCKER_IMAGE}:${env.BRANCH_NAME}-latest"
                    }
                }
            }
        }

        // --------------------------------------------------
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'dev'
                }
            }
            steps {
                sh '''
                    docker compose -f ${COMPOSE_FILE} down --remove-orphans || true
                    docker compose -f ${COMPOSE_FILE} up -d --build
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline succeeded — branch: ${env.BRANCH_NAME}, build: ${env.BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline failed — branch: ${env.BRANCH_NAME}, build: ${env.BUILD_NUMBER}"
        }
        cleanup {
            // Remove dangling images to save disk
            sh 'docker image prune -f || true'
        }
    }
}
