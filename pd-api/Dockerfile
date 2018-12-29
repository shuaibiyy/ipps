FROM java:8-alpine

ADD target/uberjar/pd-api.jar /pd-api/app.jar

EXPOSE 5000

CMD ["java", "-jar", "/pd-api/app.jar"]
