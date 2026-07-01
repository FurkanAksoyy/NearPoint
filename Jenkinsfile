// Declarative pipeline for NearPoint.
// The agent must have JDK 21, Maven (or use the ./mvnw wrapper) and access to a
// Docker daemon (Testcontainers needs it for the integration-test stage).
pipeline {
    agent any

    tools {
        jdk 'jdk-21'   // configure a JDK named 'jdk-21' under Manage Jenkins → Tools
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Build') {
            steps {
                sh './mvnw -B clean compile'
            }
        }

        stage('Unit & Slice Tests') {
            steps {
                sh './mvnw -B test'
            }
        }

        stage('Integration Tests') {
            // Requires Docker on the agent (Testcontainers)
            steps {
                sh './mvnw -B failsafe:integration-test failsafe:verify'
            }
        }

        stage('SonarQube') {
            when {
                expression { return env.SONAR_HOST_URL != null }
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh './mvnw -B sonar:sonar'
                }
            }
        }

        stage('Package') {
            steps {
                sh './mvnw -B -DskipTests package'
                archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
            }
        }
    }

    post {
        always {
            junit testResults: '**/surefire-reports/*.xml, **/failsafe-reports/*.xml', allowEmptyResults: true
        }
    }
}
