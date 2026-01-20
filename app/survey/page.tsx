// components/SurveyFrame.js
export default function SurveyFrame() {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="https://survey.biss.click/index.php?r=survey/index&sid=872125&lang=zh-Hans"
        width="100%"
        height="100%"
        frameBorder="0"
        title="班级调查"
        allow="geolocation; microphone; camera" // 如果你的问卷涉及位置或媒体上传
      ></iframe>
    </div>
  );
}