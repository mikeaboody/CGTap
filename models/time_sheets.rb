class TimeSheets < ActiveRecord::Base
	def self.timeFrom(microseconds)
		return TimeSheets.where("submission_time > " << microseconds.to_s)
	end
end