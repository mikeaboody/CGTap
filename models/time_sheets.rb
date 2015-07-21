class TimeSheets < ActiveRecord::Base
	def self.fromSevenDaysAgo(email)
		sevenDaysInMilli = 604800000
		return TimeSheets.where("submission_time > " << (Time.now.to_i * 1000 - sevenDaysInMilli).to_s << " AND email = '" << email << "'")
	end
end