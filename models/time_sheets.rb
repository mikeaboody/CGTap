class TimeSheets < ActiveRecord::Base
	def self.fromFiveDaysAgo(email)
		fiveDaysInMilli = 604800000
		return TimeSheets.where("submission_time > " << (Time.now.to_i * 1000 - fiveDaysInMilli).to_s << " AND email = '" << email << "'")
	end
end