pipeline {
    agent any

    environment {
        // Variables Docker
        DOCKER_IMAGE = 'pravin93/tasklist-backend'
        DOCKER_TAG = "v${env.BUILD_ID}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Installation & Tests') {
            steps {
                echo 'Installation...'
                sh 'npm install'
                
                echo 'Tests Unitaires...'
                sh 'npm run test'
                
                echo 'Génération de la couverture...'
                sh 'npm run test:coverage'
                
                echo 'Tests E2E...'
                sh 'npm run test:e2e'
            }
        }
        
        stage('Qualité du Code (SonarQube)') {
            steps {
                echo 'Analyse SonarQube en cours...'
                withCredentials([usernamePassword(credentialsId: 'idsonar_pravin93', passwordVariable: 'SONAR_TOKEN', usernameVariable: 'SONAR_USER')]) {
                    sh 'npx sonar-scanner -Dsonar.token=$SONAR_TOKEN'
                }
            }
        }
        
        stage('Build Image Docker') {
            steps {
                echo 'Construction de l\'image Docker...'
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Sécurité (Trivy & SBOM)') {
            steps {
                echo 'Génération du SBOM et analyse Trivy...'
                // Génération du fichier sbom-spdx.json exigé par l'épreuve
                sh "trivy image --format spdx-json --output sbom-spdx.json ${DOCKER_IMAGE}:${DOCKER_TAG}"
                
                // On sauvegarde le fichier SBOM généré pour pouvoir le télécharger depuis Jenkins
                archiveArtifacts artifacts: 'sbom-spdx.json', allowEmptyArchive: true
            }
        }
        
        stage('Push sur Docker Hub') {
            steps {
                echo 'Publication de l\'image sur Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'id_pravin93', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }
    }
}